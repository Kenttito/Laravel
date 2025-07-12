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
        
        // Always use environment PORT variable first, fallback to option, then default
        $envPort = getenv('PORT');
        $optionPort = $this->option('port');
        
        $this->info("Debug: Environment PORT: '" . $envPort . "'");
        $this->info("Debug: Option PORT: '" . $optionPort . "'");
        
        // Priority: ENV PORT > option port > default
        if (!empty($envPort) && is_numeric($envPort)) {
            $portOption = $envPort;
        } elseif (!empty($optionPort) && $optionPort !== '$PORT' && is_numeric($optionPort)) {
            $portOption = $optionPort;
        } else {
            $portOption = '8000';
        }
        
        $port = (int) $portOption; // Force integer conversion

        // Debug: Show what port we're using
        $this->info("Debug: Converted port: {$port}");
        
        // Ensure we have a valid port
        if ($port <= 0) {
            $this->error("Invalid port: {$port}. Using default port 8000.");
            $port = 8000;
        }

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
        
        // Set timeout to null (no timeout) for Railway deployment
        $process->setTimeout(null);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }
} 