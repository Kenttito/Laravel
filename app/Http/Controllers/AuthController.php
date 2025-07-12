<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Mail\Message;
use RobThree\Auth\TwoFactorAuth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Mail\VerificationEmail;

class AuthController extends Controller
{
    // Registration endpoint
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6',
                'firstName' => 'required',
                'lastName' => 'required',
                'country' => 'required',
                'currency' => 'required',
                'phone' => 'required',
            ], [
                'email.unique' => 'An account with this email address already exists. Please use a different email or try logging in.',
            ]);

            if ($validator->fails()) {
                $errors = $validator->errors();
                
                // Check if the error is specifically for duplicate email
                if ($errors->has('email') && $errors->first('email') === 'An account with this email address already exists. Please use a different email or try logging in.') {
                    return response()->json([
                        'message' => 'An account with this email address already exists. Please use a different email or try logging in.',
                        'error' => 'email_exists'
                    ], 400);
                }
                
                return response()->json(['message' => 'Validation failed', 'errors' => $errors], 400);
            }

            $data = $validator->validated();

        $user = User::create([
            'name' => $data['firstName'] . ' ' . $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'country' => $data['country'],
            'currency' => $data['currency'],
            'phone' => $data['phone'],
            'role' => $request->input('role', 'user'),
            'registrationIP' => $request->ip(),
            'isActive' => false, // Require email verification
            'emailConfirmationCode' => rand(100000, 999999),
            'emailConfirmationExpires' => Carbon::now()->addDay(),
        ]);

        // Create default wallet for the user with USD currency
        try {
            \App\Models\Wallet::create([
                'user_id' => $user->id,
                'currency' => 'USD',
                'type' => 'fiat',
                'balance' => 0,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create wallet: ' . $e->getMessage());
            // Continue without wallet creation for now
        }

        // Send verification email
        try {
            Mail::to($user->email)->send(new VerificationEmail($user->emailConfirmationCode, $user->firstName));
        } catch (\Exception $e) {
            // Log the error but don't fail registration
            \Log::error('Failed to send verification email: ' . $e->getMessage());
            // For now, we'll still create the account but log the email error
        }

        return response()->json([
            'message' => 'Account created successfully! Please check your email to verify your account.',
            'requiresVerification' => true
        ], 201);
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            \Log::error('Registration error trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Login endpoint
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
            }

            $credentials = $request->only('email', 'password');
            
            // Check if user exists first
            $user = User::where('email', $credentials['email'])->first();
            if (!$user) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            if (!$user->isActive) {
                return response()->json(['message' => 'Please verify your email before logging in.'], 403);
            }

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            \Log::error('Login error trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Login failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Email verification endpoint
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->isActive) {
            return response()->json(['message' => 'Account already verified.'], 200);
        }

        if ($user->emailConfirmationCode !== $request->code) {
            return response()->json(['message' => 'Invalid verification code.'], 400);
        }

        if (now()->greaterThan($user->emailConfirmationExpires)) {
            return response()->json(['message' => 'Verification code expired.'], 400);
        }

        $user->isActive = true;
        $user->emailConfirmationCode = null;
        $user->emailConfirmationExpires = null;
        $user->save();

        return response()->json(['message' => 'Email verified successfully!'], 200);
    }

    // Resend verification code endpoint
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->isActive) {
            return response()->json(['message' => 'Account already verified.'], 200);
        }

        $user->emailConfirmationCode = rand(100000, 999999);
        $user->emailConfirmationExpires = now()->addDay();
        $user->save();

        // Send verification email
        try {
            Mail::to($user->email)->send(new VerificationEmail($user->emailConfirmationCode, $user->firstName));
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Verification code resent. Please check your email.'], 200);
    }

    // Get verification code for development/testing
    public function getVerificationCode($email)
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->isActive) {
            return response()->json(['message' => 'Account already verified.'], 200);
        }

        return response()->json([
            'email' => $user->email,
            'verificationCode' => $user->emailConfirmationCode,
            'expires' => $user->emailConfirmationExpires
        ]);
    }

    // Forgot password: send reset code
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->passwordResetCode = rand(100000, 999999);
        $user->passwordResetExpires = now()->addHour();
        $user->save();

        // Send reset code email
        \Mail::raw('Your password reset code is: ' . $user->passwordResetCode, function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Kings Invest Password Reset Code');
        });

        return response()->json(['message' => 'Password reset code sent. Please check your email.'], 200);
    }

    // Validate reset token/code
    public function validateResetToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->passwordResetCode !== $request->code) {
            return response()->json(['message' => 'Invalid reset code.'], 400);
        }

        if (now()->greaterThan($user->passwordResetExpires)) {
            return response()->json(['message' => 'Reset code expired.'], 400);
        }

        return response()->json(['message' => 'Reset code is valid.'], 200);
    }

    // Reset password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->passwordResetCode !== $request->code) {
            return response()->json(['message' => 'Invalid reset code.'], 400);
        }

        if (now()->greaterThan($user->passwordResetExpires)) {
            return response()->json(['message' => 'Reset code expired.'], 400);
        }

        $user->password = \Hash::make($request->password);
        $user->passwordResetCode = null;
        $user->passwordResetExpires = null;
        $user->save();

        return response()->json(['message' => 'Password reset successful.'], 200);
    }

    // 2FA setup: generate secret and QR code
    public function setup2FA(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tfa = new TwoFactorAuth('Kings Invest');
        $secret = $tfa->createSecret();
        $qrCodeUrl = $tfa->getQRCodeImageAsDataUri($user->email, $secret);

        $user->twoFactorSecret = $secret;
        $user->save();

        return response()->json([
            'secret' => $secret,
            'qr' => $qrCodeUrl,
        ]);
    }

    // 2FA verify: validate code and enable 2FA
    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required',
        ]);
        $user = $request->user();
        if (!$user || !$user->twoFactorSecret) {
            return response()->json(['message' => 'Unauthorized or 2FA not setup'], 401);
        }
        $tfa = new TwoFactorAuth('Kings Invest');
        if ($tfa->verifyCode($user->twoFactorSecret, $request->code)) {
            $user->twoFactorEnabled = true;
            $user->save();
            return response()->json(['message' => '2FA enabled successfully.']);
        } else {
            return response()->json(['message' => 'Invalid 2FA code.'], 400);
        }
    }

    // 2FA validate: check code for login/session
    public function validate2FA(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user || !$user->twoFactorSecret || !$user->twoFactorEnabled) {
            return response()->json(['message' => '2FA not enabled for this user.'], 400);
        }
        $tfa = new TwoFactorAuth('Kings Invest');
        if ($tfa->verifyCode($user->twoFactorSecret, $request->code)) {
            return response()->json(['message' => '2FA code valid.']);
        } else {
            return response()->json(['message' => 'Invalid 2FA code.'], 400);
        }
    }

    // Update user profile
    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $data = $request->only(['firstName', 'lastName', 'country', 'currency', 'phone']);
        $validator = Validator::make($data, [
            'firstName' => 'required',
            'lastName' => 'required',
            'country' => 'required',
            'currency' => 'required',
            'phone' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 400);
        }

        $user->update($validator->validated());
        return response()->json(['message' => 'Profile updated successfully.', 'user' => $user]);
    }
} 