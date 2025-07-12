import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: '/kings-invest-frontend/',
    build: {
        outDir: 'build',
    },
    define: {
        'process.env.REACT_APP_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://laravel-production-7db4.up.railway.app'),
    },
});
