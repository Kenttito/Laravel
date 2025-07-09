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

    // Get all wallets for the user
    public function getWallet(Request $request)
    {
        $user = auth()->user();
        $wallets = Wallet::where('user_id', $user->id)->get();
        return response()->json(['wallets' => $wallets]);
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
        $addresses = CryptoAddress::where('user_id', $user->id)->get();
        return response()->json(['cryptoAddresses' => $addresses]);
    }
} 