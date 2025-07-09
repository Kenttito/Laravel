<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return 'OK';
});

Route::get('/api/health', function () {
    return 'OK';
});
