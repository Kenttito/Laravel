<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class AdminController extends Controller
{
    // List all users (admin only)
    public function getAllUsers(Request $request)
    {
        $query = User::query();
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('firstName', 'like', "%$search%")
                  ->orWhere('lastName', 'like', "%$search%");
            });
        }
        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }
        $users = $query->get()->makeHidden(['password']);
        return response()->json($users);
    }

    // Edit user by ID
    public function editUser(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $data = $request->only(['email', 'firstName', 'lastName', 'country', 'currency', 'phone', 'role']);
        $user->update($data);
        return response()->json($user->makeHidden(['password']));
    }

    // Delete user by ID and associated data
    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        // Delete user's wallets and transactions
        $walletsDeleted = $user->wallets()->delete();
        $transactionsDeleted = $user->transactions()->delete();
        $user->delete();
        return response()->json([
            'message' => 'User and all associated data deleted successfully',
            'walletsDeleted' => $walletsDeleted,
            'transactionsDeleted' => $transactionsDeleted
        ]);
    }

    // Assign role to user
    public function assignRole(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $user->role = $request->input('role');
        $user->save();
        return response()->json($user->makeHidden(['password']));
    }

    // List all withdrawals (admin only)
    public function getAllWithdrawals()
    {
        $withdrawals = \App\Models\Transaction::where('type', 'withdrawal')->get();
        return response()->json($withdrawals);
    }

    // List withdrawals for a specific user (admin only)
    public function getUserWithdrawals($id)
    {
        $withdrawals = \App\Models\Transaction::where('user_id', $id)->where('type', 'withdrawal')->get();
        return response()->json($withdrawals);
    }
} 