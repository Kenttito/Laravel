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
    protected $signature = 'app:create-admin-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->ask('Email');
        $password = $this->secret('Password');
        $firstName = $this->ask('First name');
        $lastName = $this->ask('Last name');
        $country = $this->ask('Country');
        $currency = $this->ask('Currency (e.g. USD)');
        $phone = $this->ask('Phone');

        if (User::where('email', $email)->exists()) {
            $this->error('A user with this email already exists.');
            return 1;
        }

        $user = User::create([
            'email' => $email,
            'password' => Hash::make($password),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'country' => $country,
            'currency' => $currency,
            'phone' => $phone,
            'role' => 'admin',
            'isActive' => true,
        ]);

        $this->info('Admin user created successfully!');
        return 0;
    }
}
