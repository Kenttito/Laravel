#!/bin/bash

cd "$(dirname "$0")"

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "Checking for artisan file:"
if [ -f artisan ]; then
    echo "artisan file found!"
else
    echo "ERROR: artisan file not found!"
    exit 1
fi

echo "Running Laravel setup..."
php artisan config:clear
php artisan cache:clear
php artisan key:generate --force

echo "Running database migrations..."
php artisan migrate --force

echo "Starting PHP server on port $PORT..."
cd public
php -S 0.0.0.0:$PORT 