<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    // User deposit request
    public function deposit(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'amount' => 'required|numeric|min:0.01',
                'currency' => 'required|string',
                'type' => 'required|string|in:fiat,crypto',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
            }

            $user = auth()->user();
            
            // For testing without JWT middleware
            if (!$user) {
                // Use admin user ID for testing
                $user = \App\Models\User::where('email', 'admin@kingsinvest.com')->first();
                if (!$user) {
                    return response()->json(['message' => 'No authenticated user found'], 401);
                }
            }
            
            // Create deposit transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => 'deposit',
                'amount' => $request->amount,
                'status' => 'pending',
                'details' => [
                    'currency' => $request->currency,
                    'type' => $request->type,
                    'description' => "Deposit of {$request->amount} {$request->currency}",
                ],
            ]);

            return response()->json([
                'message' => 'Deposit request submitted successfully. Please wait for admin approval.',
                'transaction' => $transaction
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Deposit failed',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    // Admin: Get all deposits
    public function getAllDeposits()
    {
        $deposits = Transaction::where('type', 'deposit')
            ->where('status', '!=', 'cleared')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($deposits);
    }

    // Admin: Approve deposit
    public function approveDeposit($id)
    {
        try {
            $transaction = Transaction::find($id);
            
            if (!$transaction || $transaction->type !== 'deposit') {
                return response()->json(['message' => 'Deposit not found'], 404);
            }

            if ($transaction->status !== 'pending') {
                return response()->json(['message' => 'Deposit is not pending'], 400);
            }

            // Update transaction status
            $transaction->status = 'completed';
            $transaction->save();

            // Update user's wallet balance (always USD)
            $wallet = Wallet::where('user_id', $transaction->user_id)
                ->where('currency', 'USD')
                ->first();
                
            if ($wallet) {
                $wallet->balance += $transaction->amount;
                $wallet->save();
            } else {
                // Create USD wallet if it doesn't exist
                $wallet = Wallet::create([
                    'user_id' => $transaction->user_id,
                    'currency' => 'USD',
                    'type' => 'fiat',
                    'balance' => $transaction->amount,
                ]);
            }

            return response()->json(['message' => 'Deposit approved successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve deposit',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    // Admin: Decline deposit
    public function declineDeposit($id)
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction || $transaction->type !== 'deposit') {
            return response()->json(['message' => 'Deposit not found'], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Deposit is not pending'], 400);
        }

        $transaction->status = 'declined';
        $transaction->save();

        return response()->json(['message' => 'Deposit declined successfully']);
    }

    // Admin: Manual deposit (admin can add funds to user account)
    public function adminDeposit(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userId' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string',
            'type' => 'required|string|in:fiat,crypto',
            'statType' => 'required|string|in:balance,invested,earnings',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $transactionType = 'deposit';
        $description = "Admin deposit of {$request->amount} {$request->currency}";

        // If statType is earnings, create a profit transaction instead of deposit
        if ($request->statType === 'earnings') {
            $transactionType = 'profit';
            $description = "Admin profit addition of {$request->amount} {$request->currency}";
        }

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $request->userId,
            'type' => $transactionType,
            'amount' => $request->amount,
            'status' => 'completed', // Auto-approve admin transactions
            'details' => [
                'currency' => $request->currency,
                'type' => $request->type,
                'description' => $description,
            ],
        ]);

        // Update user's wallet balance (always USD)
        $wallet = Wallet::where('user_id', $request->userId)
            ->where('currency', 'USD')
            ->first();
            
        if ($wallet) {
            $wallet->balance += $request->amount;
            $wallet->save();
        } else {
            // Create USD wallet if it doesn't exist
            $wallet = Wallet::create([
                'user_id' => $request->userId,
                'currency' => 'USD',
                'type' => 'fiat',
                'balance' => $request->amount,
            ]);
        }

        $message = $request->statType === 'earnings' ? 'Profit added successfully' : 'Deposit added successfully';

        return response()->json([
            'message' => $message,
            'transaction' => $transaction
        ]);
    }

    // Admin: Manual deduction (admin can deduct funds from user account)
    public function adminDeduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userId' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string',
            'type' => 'required|string|in:fiat,crypto',
            'statType' => 'required|string|in:balance,invested,earnings',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        // Check if user has sufficient balance
        $wallet = Wallet::where('user_id', $request->userId)
            ->where('currency', 'USD')
            ->first();
            
        if (!$wallet || $wallet->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient balance'], 400);
        }

        $transactionType = 'withdrawal';
        $description = "Admin deduction of {$request->amount} {$request->currency}";

        // If statType is earnings, create a loss transaction instead of withdrawal
        if ($request->statType === 'earnings') {
            $transactionType = 'loss';
            $description = "Admin loss deduction of {$request->amount} {$request->currency}";
        }

        // Create transaction
        $transaction = Transaction::create([
            'user_id' => $request->userId,
            'type' => $transactionType,
            'amount' => $request->amount,
            'status' => 'completed', // Auto-approve admin deductions
            'details' => [
                'currency' => $request->currency,
                'type' => $request->type,
                'description' => $description,
            ],
        ]);

        // Deduct from user's wallet balance
        $wallet->balance -= $request->amount;
        $wallet->save();

        $message = $request->statType === 'earnings' ? 'Loss deduction completed successfully' : 'Deduction completed successfully';

        return response()->json([
            'message' => $message,
            'transaction' => $transaction
        ]);
    }

    // User withdrawal request
    public function withdraw(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string',
            'type' => 'required|string|in:fiat,crypto',
            'withdrawalMethod' => 'required|string',
            'accountDetails' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $user = auth()->user();
        
        // Check if user has sufficient balance
        $wallet = Wallet::where('user_id', $user->id)
            ->where('currency', 'USD')
            ->first();
            
        if (!$wallet || $wallet->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient balance for withdrawal'], 400);
        }

        // Create withdrawal transaction
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => 'withdrawal',
            'amount' => $request->amount,
            'status' => 'pending',
            'details' => [
                'currency' => $request->currency,
                'type' => $request->type,
                'withdrawalMethod' => $request->withdrawalMethod,
                'accountDetails' => $request->accountDetails,
                'description' => "Withdrawal request of {$request->amount} {$request->currency} via {$request->withdrawalMethod}",
            ],
        ]);

        return response()->json([
            'message' => 'Withdrawal request submitted successfully. Please wait for admin approval.',
            'transaction' => $transaction
        ], 201);
    }

    // Admin: Get all withdrawals
    public function getAllWithdrawals()
    {
        $withdrawals = Transaction::where('type', 'withdrawal')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($withdrawals);
    }

    // Admin: Approve withdrawal
    public function approveWithdrawal($id)
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction || $transaction->type !== 'withdrawal') {
            return response()->json(['message' => 'Withdrawal not found'], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Withdrawal is not pending'], 400);
        }

        // Check if user still has sufficient balance
        $wallet = Wallet::where('user_id', $transaction->user_id)
            ->where('currency', 'USD')
            ->first();
            
        if (!$wallet || $wallet->balance < $transaction->amount) {
            return response()->json(['message' => 'User has insufficient balance for this withdrawal'], 400);
        }

        // Update transaction status
        $transaction->status = 'completed';
        $transaction->save();

        // Deduct from user's wallet balance
        $wallet->balance -= $transaction->amount;
        $wallet->save();

        return response()->json(['message' => 'Withdrawal approved successfully']);
    }

    // Admin: Decline withdrawal
    public function declineWithdrawal($id)
    {
        $transaction = Transaction::find($id);
        
        if (!$transaction || $transaction->type !== 'withdrawal') {
            return response()->json(['message' => 'Withdrawal not found'], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Withdrawal is not pending'], 400);
        }

        $transaction->status = 'declined';
        $transaction->save();

        return response()->json(['message' => 'Withdrawal declined successfully']);
    }

    // Admin: Clear all deposits (mark as cleared instead of deleting)
    public function clearAllDeposits()
    {
        $updatedCount = Transaction::where('type', 'deposit')
            ->where('status', '!=', 'cleared')
            ->update(['status' => 'cleared']);
        
        return response()->json([
            'message' => "Successfully cleared {$updatedCount} deposit(s) from admin view",
            'clearedCount' => $updatedCount
        ]);
    }
}
