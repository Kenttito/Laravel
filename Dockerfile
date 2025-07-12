FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Install dependencies
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# Ensure storage and cache directories exist and are writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Create a startup script that will definitely work
RUN echo '#!/bin/bash\n\
echo "Starting Laravel setup..."\n\
cd /var/www\n\
echo "Running artisan commands..."\n\
php artisan config:clear\n\
php artisan cache:clear\n\
php artisan key:generate --force\n\
echo "Running migrations..."\n\
php artisan migrate --force\n\
echo "Starting PHP server on port $PORT..."\n\
cd /var/www/public\n\
php -S 0.0.0.0:$PORT\n\
' > /var/www/start.sh && chmod +x /var/www/start.sh

# Expose port
EXPOSE 8080

# Start the application
CMD ["/var/www/start.sh"] 