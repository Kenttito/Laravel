<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ManageTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tables:manage {action=list} {--table=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage database tables - list, show, or drop tables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $tableName = $this->option('table');

        try {
            // Test database connection
            DB::connection()->getPdo();
            $this->info('Database connection successful!');
        } catch (\Exception $e) {
            $this->error('Database connection failed: ' . $e->getMessage());
            return 1;
        }

        switch ($action) {
            case 'list':
                $this->listTables();
                break;
            case 'show':
                if ($tableName) {
                    $this->showTable($tableName);
                } else {
                    $this->error('Please specify a table name with --table option');
                }
                break;
            case 'drop':
                if ($tableName) {
                    $this->dropTable($tableName);
                } else {
                    $this->error('Please specify a table name with --table option');
                }
                break;
            default:
                $this->error('Invalid action. Use: list, show, or drop');
                return 1;
        }

        return 0;
    }

    private function listTables()
    {
        $this->info('Listing all tables in database:');
        $this->line('');

        try {
            $tables = DB::select('SHOW TABLES');
            
            if (empty($tables)) {
                $this->warn('No tables found in the database.');
                return;
            }

            $laravelTables = [
                'users', 'crypto_addresses', 'investment_plans', 'demo_accounts',
                'wallets', 'transactions', 'jobs', 'cache', 'migrations',
                'password_reset_tokens', 'personal_access_tokens', 'failed_jobs'
            ];

            foreach ($tables as $table) {
                $tableName = array_values((array)$table)[0];
                $isLaravelTable = in_array($tableName, $laravelTables);
                
                if ($isLaravelTable) {
                    $this->line("✅ <info>{$tableName}</info> (Laravel table)");
                } else {
                    $this->line("📝 <comment>{$tableName}</comment> (Manual table)");
                }
            }

            $this->line('');
            $this->info('Legend:');
            $this->line('✅ Laravel tables (do not delete)');
            $this->line('📝 Manual tables (can be deleted if needed)');

        } catch (\Exception $e) {
            $this->error('Error listing tables: ' . $e->getMessage());
        }
    }

    private function showTable($tableName)
    {
        try {
            $columns = DB::select("DESCRIBE {$tableName}");
            
            $this->info("Table structure for '{$tableName}':");
            $this->line('');
            
            $headers = ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'];
            $rows = [];
            
            foreach ($columns as $column) {
                $rows[] = [
                    $column->Field,
                    $column->Type,
                    $column->Null,
                    $column->Key,
                    $column->Default ?? 'NULL',
                    $column->Extra
                ];
            }
            
            $this->table($headers, $rows);

        } catch (\Exception $e) {
            $this->error("Error showing table '{$tableName}': " . $e->getMessage());
        }
    }

    private function dropTable($tableName)
    {
        $laravelTables = [
            'users', 'crypto_addresses', 'investment_plans', 'demo_accounts',
            'wallets', 'transactions', 'jobs', 'cache', 'migrations',
            'password_reset_tokens', 'personal_access_tokens', 'failed_jobs'
        ];

        if (in_array($tableName, $laravelTables)) {
            $this->error("Cannot drop Laravel table '{$tableName}'. This is a system table.");
            return;
        }

        if (!$this->confirm("Are you sure you want to drop table '{$tableName}'?")) {
            $this->info('Table drop cancelled.');
            return;
        }

        try {
            DB::statement("DROP TABLE {$tableName}");
            $this->info("Table '{$tableName}' dropped successfully.");
        } catch (\Exception $e) {
            $this->error("Error dropping table '{$tableName}': " . $e->getMessage());
        }
    }
} 