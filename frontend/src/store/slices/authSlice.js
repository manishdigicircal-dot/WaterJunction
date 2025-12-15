import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { syncGuestCart } from './cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/phone/send-otp`, { phone });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/phone/verify-otp`, { phone, otp });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

// Track ongoing getMe requests to prevent duplicates
let getMePromise = null;
let lastGetMeTime = 0;
const GET_ME_COOLDOWN = 2000; // 2 seconds cooldown between calls

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
      
      // If there's already a pending request, return it
      if (getMePromise) {
        try {
          return await getMePromise;
        } catch (error) {
          // If the pending request fails, allow a new one
          getMePromise = null;
          throw error;
        }
      }
      
      // Rate limit: Don't call if we just called recently (unless it's been more than cooldown)
      const now = Date.now();
      if (now - lastGetMeTime < GET_ME_COOLDOWN && lastGetMeTime > 0) {
        console.warn('getMe called too frequently, skipping');
        // Return a rejection to prevent infinite loops
        return rejectWithValue('TOO_FREQUENT');
      }
      
      lastGetMeTime = now;
      getMePromise = axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { data } = await getMePromise;
      getMePromise = null;
      return data;
    } catch (error) {
      getMePromise = null;
      // Only clear token if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
      }
      // For 429 errors, reject but don't clear token
      if (error.response?.status === 429) {
        console.warn('Rate limited on getMe');
        return rejectWithValue('RATE_LIMITED');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(null);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        // Don't clear user/auth state on rate limit or too frequent errors
        if (action.payload === 'RATE_LIMITED' || action.payload === 'TOO_FREQUENT') {
          // Keep existing user data, just set error
          state.error = action.payload === 'RATE_LIMITED' 
            ? 'Rate limited. Please wait a moment.' 
            : 'Request too frequent. Please wait.';
          // Don't change isAuthenticated if we have a user
          if (state.user) {
            state.isAuthenticated = true;
          }
          return;
        }
        // Only clear auth state if token was removed (401 error)
        const token = localStorage.getItem('token');
        if (!token) {
          state.user = null;
          state.isAuthenticated = false;
          state.token = null;
        }
        // Keep existing auth state if token still exists
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

