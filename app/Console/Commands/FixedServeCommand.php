<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand as BaseServeCommand;

class FixedServeCommand extends BaseServeCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'serve:fixed {--host=0.0.0.0} {--port=8000} {--tries=10} {--no-reload}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Serve the application with fixed port handling (bypasses string + int error)';

    /**
     * Get the port for the command.
     *
     * @return int
     */
    protected function port()
    {
        $port = $this->input->getOption('port');

        if (is_null($port)) {
            [, $port] = $this->getHostAndPort();
        }

        $port = $port ?: 8000;

        // Fix: Ensure port is an integer before adding offset
        $port = (int) $port;
        
        return $port + $this->portOffset;
    }
} 