<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\CryptoAddress;

class UserController extends Controller
{
    // Get user's USD fiat wallet balance
    public function getBalance(Request $request)
    {
        $user = auth()->user();
        $wallet = Wallet::where('user_id', $user->id)->where('currency', 'USD')->where('type', 'fiat')->first();
        return response()->json(['balance' => $wallet ? $wallet->balance : 0]);
    }

    // Get all wallets for the user with calculated fields
    public function getWallet(Request $request)
    {
        $user = auth()->user();
        $wallets = Wallet::where('user_id', $user->id)->get();
        
        // Add calculated fields to each wallet
        $walletsWithCalculations = $wallets->map(function ($wallet) use ($user) {
            // Calculate total invested (sum of all deposit transactions)
            $invested = Transaction::where('user_id', $user->id)
                ->where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('amount');
            
            // Calculate total earnings (sum of all profit transactions minus losses)
            $profits = Transaction::where('user_id', $user->id)
                ->where('type', 'profit')
                ->where('status', 'completed')
                ->sum('amount');
            
            $losses = Transaction::where('user_id', $user->id)
                ->where('type', 'loss')
                ->where('status', 'completed')
                ->sum('amount');
            
            $earnings = $profits - $losses;
            
            // Calculate total withdrawals (sum of all withdrawal transactions)
            $totalWithdrawals = Transaction::where('user_id', $user->id)
                ->where('type', 'withdrawal')
                ->where('status', 'completed')
                ->sum('amount');
            
            return [
                'id' => $wallet->id,
                'user_id' => $wallet->user_id,
                'currency' => $wallet->currency,
                'type' => $wallet->type,
                'balance' => $wallet->balance,
                'invested' => $invested,
                'earnings' => $earnings,
                'totalWithdrawals' => $totalWithdrawals,
                'created_at' => $wallet->created_at,
                'updated_at' => $wallet->updated_at,
            ];
        });
        
        return response()->json(['wallets' => $walletsWithCalculations]);
    }

    // Get user's transaction/activity history
    public function getActivity(Request $request)
    {
        $user = auth()->user();
        $limit = intval($request->query('limit', 10));
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        $totalCount = Transaction::where('user_id', $user->id)->count();
        return response()->json([
            'activity' => $transactions,
            'totalCount' => $totalCount
        ]);
    }

    // Get user's crypto addresses
    public function getCryptoAddresses(Request $request)
    {
        $user = auth()->user();
        $userAddresses = CryptoAddress::where('user_id', $user->id)->get()->keyBy('currency');
        $globalAddresses = CryptoAddress::whereNull('user_id')->get()->keyBy('currency');
        $currencies = ['BTC', 'ETH', 'USDT', 'XRP'];
        $addresses = [];
        foreach ($currencies as $currency) {
            if (isset($userAddresses[$currency])) {
                $addresses[$currency] = $userAddresses[$currency]->address;
            } elseif (isset($globalAddresses[$currency])) {
                $addresses[$currency] = $globalAddresses[$currency]->address;
            } else {
                $addresses[$currency] = '';
            }
        }
        return response()->json($addresses);
    }
} 