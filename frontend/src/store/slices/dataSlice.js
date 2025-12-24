import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_URL } from '../../utils/api.js';

// Cache TTL: 10 minutes (longer cache for better performance)
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

// Request deduplication - prevent multiple simultaneous requests
let categoriesPromise = null;
let featuredProductsPromise = null;

// Async thunks
export const fetchCategories = createAsyncThunk(
  'data/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { categories, lastFetched } = state.data;
      
      // Check if we have cached data that's still fresh
      if (categories && categories.length > 0 && lastFetched?.categories) {
        const timeSinceFetch = Date.now() - lastFetched.categories;
        if (timeSinceFetch < CACHE_TTL) {
          // Return cached data immediately without making API call
          return { categories, fromCache: true };
        }
      }

      // If there's already a pending request, wait for it instead of making a new one
      if (categoriesPromise) {
        try {
          const result = await categoriesPromise;
          return result;
        } catch (error) {
          categoriesPromise = null;
          // Re-throw so outer catch handles it
          throw error;
        }
      }

      // Create a promise that wraps the axios call and transforms the response
      categoriesPromise = (async () => {
        const response = await axios.get(`${API_URL}/categories`, {
          timeout: 30000, // 30 seconds
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        // Transform to our format
        return {
          categories: response.data?.categories || [],
          fromCache: false
        };
      })();
      
      const result = await categoriesPromise;
      categoriesPromise = null;
      return result;
    } catch (error) {
      categoriesPromise = null;
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'data/fetchFeaturedProducts',
  async (limit = 8, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { featuredProducts, lastFetched } = state.data;
      
      // Check if we have cached data that's still fresh
      if (featuredProducts && featuredProducts.length > 0 && lastFetched?.featuredProducts) {
        const timeSinceFetch = Date.now() - lastFetched.featuredProducts;
        if (timeSinceFetch < CACHE_TTL) {
          // Return cached data immediately without making API call
          return { products: featuredProducts, fromCache: true };
        }
      }

      // If there's already a pending request, wait for it instead of making a new one
      if (featuredProductsPromise) {
        try {
          const result = await featuredProductsPromise;
          return result;
        } catch (error) {
          featuredProductsPromise = null;
          // Re-throw so outer catch handles it
          throw error;
        }
      }

      // Create a promise that wraps the axios call and transforms the response
      featuredProductsPromise = (async () => {
        try {
          // First try to fetch featured products
          let response = await axios.get(`${API_URL}/products?featured=true&limit=${limit}`, {
            timeout: 30000, // 30 seconds
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          console.log('Featured products response:', response.data);
          
          // If no featured products found, fallback to all active products
          if (!response.data?.products || response.data.products.length === 0) {
            console.log('No featured products found, fetching all active products...');
            response = await axios.get(`${API_URL}/products?limit=${limit}`, {
              timeout: 30000,
              headers: {
                'Cache-Control': 'no-cache'
              }
            });
            console.log('All products response:', response.data);
          }
          
          // Transform to our format
          return {
            products: response.data?.products || [],
            fromCache: false
          };
        } catch (apiError) {
          console.error('Error fetching products:', apiError);
          console.error('API URL:', `${API_URL}/products`);
          console.error('Error details:', {
            message: apiError.message,
            response: apiError.response?.data,
            status: apiError.response?.status
          });
          throw apiError;
        }
      })();
      
      const result = await featuredProductsPromise;
      featuredProductsPromise = null;
      return result;
    } catch (error) {
      featuredProductsPromise = null;
      console.error('fetchFeaturedProducts error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch featured products';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  categories: null,
  featuredProducts: null,
  loading: {
    categories: false,
    featuredProducts: false
  },
  error: {
    categories: null,
    featuredProducts: null
  },
  lastFetched: {
    categories: null,
    featuredProducts: null
  }
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = null;
      state.lastFetched.categories = null;
    },
    clearFeaturedProducts: (state) => {
      state.featuredProducts = null;
      state.lastFetched.featuredProducts = null;
    },
    clearAllCache: (state) => {
      state.categories = null;
      state.featuredProducts = null;
      state.lastFetched = {
        categories: null,
        featuredProducts: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        // Only set loading to true if we don't have cached data
        // This prevents loading spinner flicker when using cache
        if (!state.categories || !state.lastFetched?.categories || 
            Date.now() - state.lastFetched.categories >= CACHE_TTL) {
          state.loading.categories = true;
        }
        state.error.categories = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        // Update categories - handle both cached and fresh data
        if (action.payload.categories) {
          state.categories = action.payload.categories;
          // Only update timestamp for fresh data
          if (!action.payload.fromCache) {
            state.lastFetched.categories = Date.now();
          }
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.payload;
      })
      // Fetch Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        // Only set loading to true if we don't have cached data
        if (!state.featuredProducts || !state.lastFetched?.featuredProducts || 
            Date.now() - state.lastFetched.featuredProducts >= CACHE_TTL) {
          state.loading.featuredProducts = true;
        }
        state.error.featuredProducts = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading.featuredProducts = false;
        // Update products - handle both cached and fresh data
        if (action.payload.products) {
          state.featuredProducts = action.payload.products;
          // Only update timestamp for fresh data
          if (!action.payload.fromCache) {
            state.lastFetched.featuredProducts = Date.now();
          }
        }
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading.featuredProducts = false;
        state.error.featuredProducts = action.payload;
      });
  }
});

export const { clearCategories, clearFeaturedProducts, clearAllCache } = dataSlice.actions;
export default dataSlice.reducer;

