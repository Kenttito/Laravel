<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvestmentPlanController;
use App\Http\Controllers\TraderSignalsController;
use App\Http\Controllers\DemoController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/auth/reset-password/validate', [AuthController::class, 'validateResetToken']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::middleware('auth:sanctum')->post('/auth/2fa/setup', [AuthController::class, 'setup2FA']);
Route::middleware('auth:sanctum')->post('/auth/2fa/verify', [AuthController::class, 'verify2FA']);
Route::post('/auth/2fa/validate', [AuthController::class, 'validate2FA']);
Route::middleware('jwt.auth')->get('/auth/profile', function () {
    return response()->json(['user' => auth()->user()]);
});
Route::middleware('jwt.auth')->put('/auth/profile', [AuthController::class, 'updateProfile']);
Route::middleware('jwt.auth')->get('/user/balance', [UserController::class, 'getBalance']);
Route::middleware('jwt.auth')->get('/user/wallet', [UserController::class, 'getWallet']);
Route::middleware('jwt.auth')->get('/user/activity', [UserController::class, 'getActivity']);
Route::middleware('jwt.auth')->get('/user/crypto-addresses', [UserController::class, 'getCryptoAddresses']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->get('/user/all', [\App\Http\Controllers\AdminController::class, 'getAllUsers']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->put('/user/{id}', [\App\Http\Controllers\AdminController::class, 'editUser']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->delete('/user/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->put('/user/{id}/role', [\App\Http\Controllers\AdminController::class, 'assignRole']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->get('/user/withdrawals', [\App\Http\Controllers\AdminController::class, 'getAllWithdrawals']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->get('/user/{id}/withdrawals', [\App\Http\Controllers\AdminController::class, 'getUserWithdrawals']);
Route::get('/investment-plans', [InvestmentPlanController::class, 'index']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->post('/investment-plans', [InvestmentPlanController::class, 'store']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->put('/investment-plans/{id}', [InvestmentPlanController::class, 'update']);
Route::middleware(['jwt.auth', function ($request, $next) {
    if (auth()->user()->role !== 'admin') {
        return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
}])->delete('/investment-plans/{id}', [InvestmentPlanController::class, 'destroy']);
Route::get('/trader-signals/recent', [TraderSignalsController::class, 'recent']);
Route::middleware('jwt.auth')->get('/demo/account', [DemoController::class, 'getAccount']);
Route::middleware('jwt.auth')->post('/demo/trade', [DemoController::class, 'trade']);
Route::middleware('jwt.auth')->post('/demo/reset', [DemoController::class, 'reset']); 