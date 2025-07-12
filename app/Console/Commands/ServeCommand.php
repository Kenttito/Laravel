<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ServeCommand extends Command
{
    protected $signature = 'serve {--host=0.0.0.0} {--port=8000}';
    protected $description = 'Serve the application on the PHP development server';

    public function handle()
    {
        $host = $this->option('host');
        $portOption = $this->option('port');
        
        // If port option is empty, try to get it from environment
        if (empty($portOption)) {
            $portOption = getenv('PORT') ?: '8000';
        }
        
        $port = (int) $portOption; // Force integer conversion

        // Debug: Show what port we're using
        $this->info("Debug: Raw port option: " . $this->option('port'));
        $this->info("Debug: Converted port: {$port}");
        $this->info("Debug: Environment PORT: " . getenv('PORT'));

        $this->info("Starting Laravel development server on http://{$host}:{$port}");

        $process = new Process([
            'php',
            '-S',
            "{$host}:{$port}",
            '-t',
            public_path(),
            public_path('index.php')
        ]);

        $process->setWorkingDirectory(base_path());
        // Remove TTY mode for Railway deployment
        // $process->setTty(true);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }
} 