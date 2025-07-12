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

        // Create a router file for proper Laravel handling
        $routerContent = '<?php
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));

// This file allows us to emulate Apache\'s "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Laravel
// application without having installed a "real" web server software here.
if ($uri !== "/" && file_exists(__DIR__."/public".$uri)) {
    return false;
}

require_once __DIR__."/public/index.php";
';
        
        $routerPath = storage_path('router.php');
        file_put_contents($routerPath, $routerContent);

        $process = new Process([
            'php',
            '-S',
            "{$host}:{$port}",
            '-t',
            public_path(),
            $routerPath
        ]);

        $process->setWorkingDirectory(base_path());
        // Remove TTY mode for Railway deployment
        // $process->setTty(true);
        
        // Set timeout to null (no timeout) for Railway deployment
        $process->setTimeout(null);
        
        // Set environment variables for Railway
        $process->setEnv([
            'APP_ENV' => getenv('APP_ENV') ?: 'production',
            'APP_DEBUG' => getenv('APP_DEBUG') ?: 'false',
            'PORT' => $port
        ]);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }
} 