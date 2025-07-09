<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;

class FixTransactionStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-transaction-status';

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
        $this->info('Checking for transactions without status field or with invalid status...');

        // Fix transactions with null or missing status
        $transactionsWithoutStatus = Transaction::whereNull('status')->get();
        $this->info('Found ' . $transactionsWithoutStatus->count() . ' transactions without status');
        foreach ($transactionsWithoutStatus as $tx) {
            $defaultStatus = in_array($tx->type, ['trade', 'return']) ? 'completed' : 'pending';
            $tx->status = $defaultStatus;
            $tx->save();
            $this->info("Fixed transaction {$tx->id} with status: {$defaultStatus}");
        }

        // Fix transactions with invalid status
        $validStatuses = ['pending', 'approved', 'declined', 'completed'];
        $invalidStatusTransactions = Transaction::whereNotIn('status', $validStatuses)->get();
        $this->info('Found ' . $invalidStatusTransactions->count() . ' transactions with invalid status');
        foreach ($invalidStatusTransactions as $tx) {
            $newStatus = in_array($tx->type, ['trade', 'return']) ? 'completed' : 'pending';
            $tx->status = $newStatus;
            $tx->save();
            $this->info("Fixed transaction {$tx->id} with new status: {$newStatus}");
        }

        $this->info('All transactions fixed!');
        return 0;
    }
}
