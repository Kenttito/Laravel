FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Apache
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
RUN a2enmod rewrite

# Configure Apache for Laravel
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copy composer files and essential Laravel files first for better caching
COPY Backend/composer.json Backend/composer.lock ./
COPY Backend/artisan ./
COPY Backend/bootstrap/ ./bootstrap/
COPY Backend/app/ ./app/
COPY Backend/config/ ./config/
COPY Backend/routes/ ./routes/

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy package files for npm
COPY Backend/package.json Backend/package-lock.json ./

# Install Node.js dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY Backend/ .

# Build assets
RUN npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"] 