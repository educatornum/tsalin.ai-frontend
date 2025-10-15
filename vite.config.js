import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For server deployment, use '/' as base
// For GitHub Pages, change to '/tsalin.ai-frontend/'
export default defineConfig({
  plugins: [react()],
  base: '/'
});


