#!/bin/bash

# Set default port if not provided and ensure it's a valid integer
PORT=${PORT:-8000}

# Convert to integer and validate
if [[ ! "$PORT" =~ ^[0-9]+$ ]]; then
    echo "Error: PORT must be a valid integer, got: $PORT"
    exit 1
fi

PORT_INT=$((PORT))

# Validate port range
if [ "$PORT_INT" -lt 1 ] || [ "$PORT_INT" -gt 65535 ]; then
    echo "Error: PORT must be between 1 and 65535, got: $PORT_INT"
    exit 1
fi

echo "Starting Laravel on port: $PORT_INT"

# Change to the project root directory where artisan is located
cd /var/www

# Clear any cached configurations
php artisan config:clear
php artisan cache:clear

# Generate application key if not set
php artisan key:generate --force

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Change back to public directory for serving
cd /var/www/public

# Start PHP's built-in server serving from public directory
echo "Starting with PORT_INT: $PORT_INT"
exec php -S 0.0.0.0:$PORT_INT 