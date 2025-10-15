// API Configuration
// Change this to your backend server URL

const getApiUrl = () => {
  // If VITE_API_URL is set in environment, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production: use relative path (nginx will proxy to backend)
  if (import.meta.env.MODE === 'production') {
    return ''; // Use relative URLs like /api/... (nginx proxies to backend)
  }
  
  // Development: use localhost
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

