import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        {
            name: 'copy-404',
            writeBundle() {
                copyFileSync('404.html', 'build/404.html');
            },
        },
    ],
    base: '/kings-invest-frontend/',
    build: {
        outDir: 'build',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            },
        },
    },
    define: {
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://laravel-production-7db4.up.railway.app'),
    },
});
