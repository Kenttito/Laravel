<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-admin-user {--email=admin@kingsinvest.com} {--password=admin123} {--firstName=Admin} {--lastName=User} {--country=United States} {--currency=USD} {--phone=+1234567890}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user with default or custom credentials';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        $firstName = $this->option('firstName');
        $lastName = $this->option('lastName');
        $country = $this->option('country');
        $currency = $this->option('currency');
        $phone = $this->option('phone');

        if (User::where('email', $email)->exists()) {
            $this->error('A user with this email already exists.');
            return 1;
        }

        $user = User::create([
            'name' => $firstName . ' ' . $lastName,
            'email' => $email,
            'password' => Hash::make($password),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'country' => $country,
            'currency' => $currency,
            'phone' => $phone,
            'role' => 'admin',
            'isActive' => true,
            'registrationIP' => '127.0.0.1',
        ]);

        $this->info('Admin user created successfully!');
        $this->info('Email: ' . $email);
        $this->info('Password: ' . $password);
        $this->info('Role: admin');
        return 0;
    }
}
