#!/bin/bash

# Generate application key if not set
php artisan key:generate --force

# Run database migrations
php artisan migrate --force

# Clear and cache configuration
php artisan config:clear
php artisan config:cache

# Clear and cache routes
php artisan route:clear
php artisan route:cache

# Clear and cache views
php artisan view:clear
php artisan view:cache

# Start the application
./start.sh 