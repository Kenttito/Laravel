<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Wallet;

class UpdateWalletCurrencies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wallets:update-currencies';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all existing wallets to use USD as the default currency';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating wallet currencies to USD...');

        $updatedCount = Wallet::where('currency', '!=', 'USD')->update(['currency' => 'USD']);

        $this->info("Updated {$updatedCount} wallets to use USD currency.");

        // Also update users' currency preference to USD
        $userUpdatedCount = \App\Models\User::where('currency', '!=', 'USD')->update(['currency' => 'USD']);
        
        $this->info("Updated {$userUpdatedCount} users' currency preference to USD.");

        $this->info('Wallet currency update completed successfully!');
    }
}
