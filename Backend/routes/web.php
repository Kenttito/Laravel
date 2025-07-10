<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return 'OK';
});

Route::get('/api/health', function () {
    return 'OK';
});

Route::get('/debug', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'Database connection successful!';
    } catch (\Exception $e) {
        $dbStatus = 'Database connection failed: ' . $e->getMessage();
    }
    return response()->json([
        'env' => [
            'APP_ENV' => env('APP_ENV'),
            'APP_DEBUG' => env('APP_DEBUG'),
            'DB_HOST' => env('DB_HOST'),
            'DB_PORT' => env('DB_PORT'),
            'DB_DATABASE' => env('DB_DATABASE'),
            'DB_USERNAME' => env('DB_USERNAME'),
        ],
        'db' => $dbStatus,
    ]);
});

Route::get('/debug-files', function () {
    $files = scandir(public_path());
    return response()->json(['public_files' => $files]);
});
