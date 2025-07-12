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

# Ensure storage and cache directories exist and are writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Install dependencies
RUN composer clear-cache && rm -rf vendor/ && composer install --ignore-platform-reqs --no-dev

# Create a startup script with debug output and artisan check
RUN echo '#!/bin/bash\n\
echo "Current directory: \\$(pwd)"\n\
echo "Listing /var/www:"\nls -l /var/www\n\
echo "Listing /var/www/public:"\nls -l /var/www/public\n\
if [ ! -f /var/www/artisan ]; then\n  echo "ERROR: artisan file not found in /var/www!"\n  exit 1\nfi\n\ncd /var/www\nphp artisan config:clear\nphp artisan cache:clear\nphp artisan key:generate --force\nphp artisan migrate --force\ncd /var/www/public\nphp -S 0.0.0.0:$PORT\n' > /var/www/start.sh && chmod +x /var/www/start.sh

# Expose port
EXPOSE 8080

# Start the application
CMD ["/var/www/start.sh"] 