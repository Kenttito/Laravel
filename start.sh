#!/bin/bash

# Ensure we're in the correct directory
cd /app

# Fix permissions for Laravel
chmod -R 775 storage bootstrap/cache

# Start Laravel server
php artisan serve --host=0.0.0.0 --port=$PORT 