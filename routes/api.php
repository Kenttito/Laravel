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

// Database test endpoint
Route::get('/test-db', function() {
    try {
        $userCount = \App\Models\User::count();
        return response()->json([
            'message' => 'Database connection works', 
            'user_count' => $userCount,
            'tables' => \DB::select('SHOW TABLES')
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvestmentPlanController;
use App\Http\Controllers\TraderSignalsController;
use App\Http\Controllers\DemoController;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

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
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Test verification email route
Route::get('/test-verification-email', function () {
    try {
        $verificationCode = rand(100000, 999999);
        \Mail::to('test@example.com')->send(new \App\Mail\VerificationEmail($verificationCode, 'Test User'));
        return response()->json(['message' => 'Verification email sent successfully!', 'code' => $verificationCode]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});
// Test registration endpoint (for development only)
Route::post('/auth/test-register', function (Request $request) {
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'firstName' => 'required',
            'lastName' => 'required',
            'country' => 'required',
            'currency' => 'required',
            'phone' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        $user = \App\Models\User::create([
            'name' => $data['firstName'] . ' ' . $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'country' => $data['country'],
            'currency' => $data['currency'],
            'phone' => $data['phone'],
            'role' => 'user',
            'registrationIP' => $request->ip(),
            'isActive' => true, // Skip email verification for testing
            'emailConfirmationCode' => null,
            'emailConfirmationExpires' => null,
        ]);

        // Create default wallet
        \App\Models\Wallet::create([
            'user_id' => $user->id,
            'currency' => 'USD',
            'type' => 'fiat',
            'balance' => 0,
        ]);

        return response()->json([
            'message' => 'Account created successfully!',
            'user' => $user
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create user',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Create admin user endpoint (for development only)
Route::post('/auth/create-admin', function (Request $request) {
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'firstName' => 'required',
            'lastName' => 'required',
            'country' => 'required',
            'currency' => 'required',
            'phone' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $data = $validator->validated();

        $user = \App\Models\User::create([
            'name' => $data['firstName'] . ' ' . $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'country' => $data['country'],
            'currency' => $data['currency'],
            'phone' => $data['phone'],
            'role' => 'admin',
            'registrationIP' => $request->ip(),
            'isActive' => true,
            'emailConfirmationCode' => null,
            'emailConfirmationExpires' => null,
        ]);

        // Create default wallet
        \App\Models\Wallet::create([
            'user_id' => $user->id,
            'currency' => 'USD',
            'type' => 'fiat',
            'balance' => 0,
        ]);

        return response()->json([
            'message' => 'Admin user created successfully!',
            'user' => $user
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to create admin user',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Update user role endpoint (for development only)
Route::post('/auth/update-role', function (Request $request) {
    try {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:user,admin',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $user = \App\Models\User::where('email', $request->email)->first();
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'User role updated successfully!',
            'user' => $user
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update user role',
            'error' => $e->getMessage()
        ], 500);
    }
});
// Transaction routes
Route::middleware('jwt.auth')->post('/transaction/deposit', [\App\Http\Controllers\TransactionController::class, 'deposit']);

// Temporary test route without JWT middleware
Route::post('/test-deposit', [\App\Http\Controllers\TransactionController::class, 'deposit']);

// Temporary test approve route without JWT middleware
Route::post('/test-approve/{id}', [\App\Http\Controllers\TransactionController::class, 'approveDeposit']);
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
Route::get('/admin/crypto-addresses', [\App\Http\Controllers\AdminController::class, 'getCryptoAddresses']);
Route::post('/admin/crypto-addresses', [\App\Http\Controllers\AdminController::class, 'updateCryptoAddresses']);

// Test crypto address routes without JWT middleware
Route::get('/test-crypto-addresses', [\App\Http\Controllers\AdminController::class, 'getCryptoAddresses']);
Route::post('/test-crypto-addresses', [\App\Http\Controllers\AdminController::class, 'updateCryptoAddresses']);

// Add clear deposits route
Route::middleware(['jwt.auth', 'admin'])->delete('/transaction/deposits/clear', [\App\Http\Controllers\TransactionController::class, 'clearAllDeposits']);

// Test JWT middleware
Route::middleware('jwt.auth')->get('/test-jwt', function () {
    return response()->json([
        'message' => 'JWT middleware working!',
        'user' => auth()->user()
    ]);
});
