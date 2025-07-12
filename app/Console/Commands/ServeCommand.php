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
        $port = (int) $this->option('port'); // Force integer conversion

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
        $process->setTty(true);

        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        return $process->getExitCode();
    }
} 