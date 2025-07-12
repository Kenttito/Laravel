<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Check if admin already exists
$existingAdmin = User::where('email', 'admin@kingsinvest.com')->first();
if ($existingAdmin) {
    echo "Admin user already exists!\n";
    echo "Email: " . $existingAdmin->email . "\n";
    echo "Role: " . $existingAdmin->role . "\n";
    echo "Active: " . ($existingAdmin->isActive ? 'Yes' : 'No') . "\n";
    exit(0);
}

// Create admin user
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'admin@kingsinvest.com',
    'password' => Hash::make('admin123'),
    'firstName' => 'Admin',
    'lastName' => 'User',
    'country' => 'United States',
    'currency' => 'USD',
    'phone' => '+1234567890',
    'role' => 'admin',
    'isActive' => true,
    'registrationIP' => '127.0.0.1',
]);

echo "Admin user created successfully!\n";
echo "Email: " . $admin->email . "\n";
echo "Password: admin123\n";
echo "Role: " . $admin->role . "\n"; 