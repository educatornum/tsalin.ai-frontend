import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// If deploying to https://<username>.github.io/<repo>/, set base to '/<repo>/'
// Adjust if your repository name differs
export default defineConfig({
  plugins: [react()],
  base: '/',
// local дээрээ proxy-лэх
//   server: {
//     proxy: {
//       '/api': {
//         target: process.env.VITE_API_URL || 'http://localhost:3000',
//         changeOrigin: true,
//         secure: false,
//         configure: (proxy, options) => {
//           console.log(`🔧 API Proxy: ${options.target}`);
//         }
//       }
//     }
//   }
});


