// API Configuration
// Change this to your backend server URL

const getApiUrl = () => {
  // If VITE_API_URL is set in environment, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production: use your backend URL
  if (import.meta.env.MODE === 'production') {
    // OPTION 1: Backend on same server, different port
    return 'http://35.198.155.219:3000';
    
    // OPTION 2: Backend on subdomain (uncomment when ready)
    // return 'https://api.tsalin.ai';
  }
  
  // Development: use localhost
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

