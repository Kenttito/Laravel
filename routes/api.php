<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});

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
Route::get('/auth/verification-code/{email}', [AuthController::class, 'getVerificationCode']);
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

// User profile routes (aliases for auth/profile)
Route::middleware('jwt.auth')->get('/user/profile', function () {
    return response()->json(['user' => auth()->user()]);
});
Route::middleware('jwt.auth')->put('/user/profile', [AuthController::class, 'updateProfile']);
Route::middleware('jwt.auth')->get('/user/balance', [UserController::class, 'getBalance']);
Route::middleware('jwt.auth')->get('/user/wallet', [UserController::class, 'getWallet']);
Route::middleware('jwt.auth')->get('/user/activity', [UserController::class, 'getActivity']);
Route::middleware('jwt.auth')->get('/user/crypto-addresses', [UserController::class, 'getCryptoAddresses']);
Route::middleware(['jwt.auth', 'admin'])->get('/user/all', [\App\Http\Controllers\AdminController::class, 'getAllUsers']);
Route::middleware(['jwt.auth', 'admin'])->put('/user/{id}', [\App\Http\Controllers\AdminController::class, 'editUser']);
Route::middleware(['jwt.auth', 'admin'])->delete('/user/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
Route::middleware(['jwt.auth', 'admin'])->put('/user/{id}/role', [\App\Http\Controllers\AdminController::class, 'assignRole']);
Route::middleware(['jwt.auth', 'admin'])->get('/user/withdrawals', [\App\Http\Controllers\AdminController::class, 'getAllWithdrawals']);
Route::middleware(['jwt.auth', 'admin'])->get('/user/{id}/withdrawals', [\App\Http\Controllers\AdminController::class, 'getUserWithdrawals']);
Route::get('/investment-plans', [InvestmentPlanController::class, 'index']);
Route::middleware(['jwt.auth', 'admin'])->post('/investment-plans', [InvestmentPlanController::class, 'store']);
Route::middleware(['jwt.auth', 'admin'])->put('/investment-plans/{id}', [InvestmentPlanController::class, 'update']);
Route::middleware(['jwt.auth', 'admin'])->delete('/investment-plans/{id}', [InvestmentPlanController::class, 'destroy']);
Route::get('/trader-signals/recent', [TraderSignalsController::class, 'recent']);
Route::middleware('jwt.auth')->get('/demo/account', [DemoController::class, 'getAccount']);
Route::middleware('jwt.auth')->post('/demo/trade', [DemoController::class, 'trade']);
Route::middleware('jwt.auth')->post('/demo/reset', [DemoController::class, 'reset']);

// Test email route
Route::get('/test-email', function () {
    try {
        \Mail::raw('This is a test email from Kings Invest!', function ($message) {
            $message->to('test@example.com')
                ->subject('Test Email from Kings Invest');
        });
        return response()->json(['message' => 'Test email sent successfully!']);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}); 
// Transaction routes
Route::middleware('jwt.auth')->post('/transaction/deposit', [\App\Http\Controllers\TransactionController::class, 'deposit']);
Route::middleware(['jwt.auth', 'admin'])->get('/admin/deposits', [\App\Http\Controllers\TransactionController::class, 'getAllDeposits']);
Route::middleware(['jwt.auth', 'admin'])->post('/admin/deposit/approve/{id}', [\App\Http\Controllers\TransactionController::class, 'approveDeposit']);
Route::middleware(['jwt.auth', 'admin'])->post('/admin/deposit/decline/{id}', [\App\Http\Controllers\TransactionController::class, 'declineDeposit']);
Route::middleware(['jwt.auth', 'admin'])->post('/transaction/admin/deposit', [\App\Http\Controllers\TransactionController::class, 'adminDeposit']);
Route::middleware(['jwt.auth', 'admin'])->post('/transaction/admin/deduct', [\App\Http\Controllers\TransactionController::class, 'adminDeduct']);

// Withdrawal routes
Route::middleware('jwt.auth')->post('/transaction/withdraw', [\App\Http\Controllers\TransactionController::class, 'withdraw']);
Route::middleware(['jwt.auth', 'admin'])->get('/admin/withdrawals', [\App\Http\Controllers\TransactionController::class, 'getAllWithdrawals']);
Route::middleware(['jwt.auth', 'admin'])->post('/admin/withdrawal/approve/{id}', [\App\Http\Controllers\TransactionController::class, 'approveWithdrawal']);
Route::middleware(['jwt.auth', 'admin'])->post('/admin/withdrawal/decline/{id}', [\App\Http\Controllers\TransactionController::class, 'declineWithdrawal']);

// Add admin crypto address management routes
Route::middleware(['jwt.auth', 'admin'])->get('/admin/crypto-addresses', [\App\Http\Controllers\AdminController::class, 'getCryptoAddresses']);
Route::middleware(['jwt.auth', 'admin'])->post('/admin/crypto-addresses', [\App\Http\Controllers\AdminController::class, 'updateCryptoAddresses']);

// Add clear deposits route
Route::middleware(['jwt.auth', 'admin'])->delete('/transaction/deposits/clear', [\App\Http\Controllers\TransactionController::class, 'clearAllDeposits']);
