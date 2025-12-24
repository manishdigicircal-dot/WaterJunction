import axios from 'axios';
import { API_URL } from './api.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ IMPORTANT for cookies & auth
  timeout: 30000, // 30 seconds timeout for all requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle cache write failures - request succeeded but browser couldn't cache
    // If we have a response with success status, treat it as success
    if (error.code === 'ERR_CACHE_WRITE_FAILURE' && error.response && error.response.status >= 200 && error.response.status < 300) {
      // Request succeeded, return the response instead of rejecting
      return Promise.resolve(error.response);
    }
    
    // Handle network errors - suppress console errors for cache write failures
    // These are browser cache issues, not actual network problems
    if (error.code === 'ERR_NETWORK') {
      // Check if this is likely a cache write failure (request might have succeeded)
      // Don't log these as they're usually false positives from browser cache issues
      if (error.message && error.message.includes('cache')) {
        // Silently handle cache-related network errors
        // The caller will handle the retry logic if needed
      }
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      // Don't reject timeout errors immediately, let the caller handle retry logic
    }
    
    // Handle network errors that might have succeeded (common with cache failures)
    if (error.code === 'ERR_NETWORK' && error.response) {
      // Network error but we have a response - likely a cache write failure
      // Return the response if status is successful
      if (error.response.status >= 200 && error.response.status < 300) {
        return Promise.resolve(error.response);
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

      if (error.message && error.message.includes('cache')) {
        // Silently handle cache-related network errors
        // The caller will handle the retry logic if needed
      }
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout:', error.config?.url);
      // Don't reject timeout errors immediately, let the caller handle retry logic
    }
    
    // Handle network errors that might have succeeded (common with cache failures)
    if (error.code === 'ERR_NETWORK' && error.response) {
      // Network error but we have a response - likely a cache write failure
      // Return the response if status is successful
      if (error.response.status >= 200 && error.response.status < 300) {
        return Promise.resolve(error.response);
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
