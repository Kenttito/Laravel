<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Wallet;

class CreateMissingWallets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:create-missing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create missing wallets for existing users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        $created = 0;

        foreach ($users as $user) {
            $existingWallet = Wallet::where('user_id', $user->id)->first();
            
            if (!$existingWallet) {
                Wallet::create([
                    'user_id' => $user->id,
                    'currency' => 'USD',
                    'type' => 'fiat',
                    'balance' => 0,
                ]);
                $created++;
                $this->info("Created wallet for user: {$user->email}");
            }
        }

        $this->info("Created {$created} wallets for users who didn't have one.");
    }
}
