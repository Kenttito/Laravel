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

# Ensure .env exists (create basic one if .env.example doesn't exist)
RUN if [ ! -f .env ]; then \
        if [ -f .env.example ]; then \
            cp .env.example .env; \
        else \
            echo "APP_NAME=Laravel" > .env && \
            echo "APP_ENV=production" >> .env && \
            echo "APP_KEY=base64:$(openssl rand -base64 32)" >> .env && \
            echo "APP_DEBUG=false" >> .env && \
            echo "APP_URL=https://your-app-url.railway.app" >> .env && \
            echo "LOG_CHANNEL=stack" >> .env && \
            echo "LOG_LEVEL=debug" >> .env && \
            echo "DB_CONNECTION=mysql" >> .env && \
            echo "DB_HOST=mysql.railway.internal" >> .env && \
            echo "DB_PORT=3306" >> .env && \
            echo "DB_DATABASE=railway" >> .env && \
            echo "DB_USERNAME=root" >> .env && \
            echo "DB_PASSWORD=" >> .env && \
            echo "BROADCAST_DRIVER=log" >> .env && \
            echo "CACHE_DRIVER=file" >> .env && \
            echo "FILESYSTEM_DISK=local" >> .env && \
            echo "QUEUE_CONNECTION=sync" >> .env && \
            echo "SESSION_DRIVER=file" >> .env && \
            echo "SESSION_LIFETIME=120" >> .env; \
        fi; \
    fi

# Ensure storage and cache directories exist and are writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache

# Install dependencies
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# Change current user to www-data
USER www-data

# Expose port 8000
EXPOSE 8000

# Start Laravel with proper PORT handling
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000} 