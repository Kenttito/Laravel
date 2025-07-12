#!/bin/bash

# Set default port if not provided and convert to integer
PORT=${PORT:-8000}
PORT_INT=$((PORT))

# Clear any cached configurations
php artisan config:clear
php artisan cache:clear

# Generate application key if not set
php artisan key:generate --force

# Start Laravel with explicit integer port handling
exec php artisan serve --host=0.0.0.0 --port=$PORT_INT 