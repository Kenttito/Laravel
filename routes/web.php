<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'OK';
});

Route::get('/api/health', function () {
    return 'OK';
});

// Simple health check that doesn't use any Laravel helpers
Route::get('/ping', function () {
    return 'pong';
});
