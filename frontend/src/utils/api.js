// Central API URL configuration
// If VITE_API_URL is set, use it (for cross-origin deployments like Vercel + Render)
// Otherwise, in production use relative URL (if frontend and backend are on same domain)
// In development, use localhost
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://waterjunction.onrender.com/api' // Default to Render backend for production
    : 'http://localhost:5000/api');

