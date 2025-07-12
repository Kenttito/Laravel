#!/bin/bash

# Get the port from environment variable, default to 8000
PORT=${PORT:-8000}

# Convert to integer to avoid type issues
PORT_INT=$(($PORT))

# Start Laravel
php artisan serve --host=0.0.0.0 --port=$PORT_INT 