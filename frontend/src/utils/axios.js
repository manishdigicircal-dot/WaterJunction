import axios from 'axios';
import { API_URL } from './api.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ IMPORTANT for cookies & auth
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
