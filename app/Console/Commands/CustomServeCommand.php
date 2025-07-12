<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class CustomServeCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'serve:custom {--host=0.0.0.0} {--port=8000}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Serve the application using PHP built-in server (bypasses Laravel ServeCommand)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $host = $this->option('host');
        $port = (int) $this->option('port');

        $this->info("Starting Laravel application on http://{$host}:{$port}");

        // Use PHP's built-in server directly with router
        $process = new Process([
            'php',
            '-S',
            "{$host}:{$port}",
            '-t',
            public_path(),
            public_path('index.php')
        ]);

        $process->setWorkingDirectory(base_path());
        $process->setTty(true);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }
} 