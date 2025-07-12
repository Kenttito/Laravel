#!/bin/bash

# Set default port if not provided
export PORT=${PORT:-8000}

# Clear any cached configurations
php artisan config:clear
php artisan cache:clear

# Generate application key if not set
php artisan key:generate --force

# Start Laravel with explicit port handling
exec php artisan serve --host=0.0.0.0 --port=$PORT 