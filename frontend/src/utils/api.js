// Central API URL configuration
// In production, use relative URL since frontend and backend are on same domain
// In development, use localhost
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api');

