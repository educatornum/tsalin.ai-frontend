import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If deploying to https://<username>.github.io/<repo>/, set base to '/<repo>/'
// Adjust if your repository name differs
export default defineConfig({
  plugins: [react()],
  base: '/tsalin.ai-frontend/'
});


