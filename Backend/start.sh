#!/bin/bash

# Set working directory
cd /var/www/html

# Run Laravel setup commands with error handling
echo "Setting up Laravel..."

# Only run cache commands if .env exists and APP_KEY is set
if [ -f .env ] && grep -q "APP_KEY=" .env; then
    echo "Running Laravel cache commands..."
    php artisan config:cache || echo "Config cache failed, continuing..."
    php artisan route:cache || echo "Route cache failed, continuing..."
    php artisan view:cache || echo "View cache failed, continuing..."
else
    echo "Skipping Laravel cache commands - .env not properly configured"
fi

echo "Starting Apache..."
# Start Apache
apache2-foreground 