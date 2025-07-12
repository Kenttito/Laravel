FROM php:8.3-fpm

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

# Ensure .env exists
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Ensure storage and cache directories exist and are writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Install dependencies
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# Change current user to www-data
USER www-data

# Expose port 8000
EXPOSE 8000

# Start Laravel
CMD php artisan serve --host=0.0.0.0 --port=8000 