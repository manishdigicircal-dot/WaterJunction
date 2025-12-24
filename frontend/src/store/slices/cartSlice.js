import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../utils/api.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Guest cart helper functions
const GUEST_CART_KEY = 'waterjunction_guest_cart';

const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [] };
  } catch (error) {
    return { items: [] };
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

const getGuestCartItemCount = () => {
  const cart = getGuestCart();
  return cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
};

// Track ongoing requests to prevent duplicates
let cartFetchPromise = null;

// Fetch cart (authenticated users) or guest cart
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue, getState }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Return guest cart
    const guestCart = getGuestCart();
    return { ...guestCart, isGuest: true };
  }
  
  // If there's already a pending request, return it
  if (cartFetchPromise) {
    try {
      return await cartFetchPromise;
    } catch (error) {
      // If the pending request fails, allow a new one
      cartFetchPromise = null;
      throw error;
    }
  }
  
  try {
    cartFetchPromise = axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
    const { data } = await cartFetchPromise;
    cartFetchPromise = null;
    return data.cart;
  } catch (error) {
    cartFetchPromise = null;
    // For rate limit errors, return guest cart instead of rejecting
    if (error.response?.status === 429) {
      console.warn('Rate limited on cart fetch, using cached/guest cart');
      const guestCart = getGuestCart();
      return { ...guestCart, isGuest: true };
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

// Add to cart (works for both authenticated and guest users)
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variant }, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    // If not authenticated, use guest cart
    if (!token) {
      try {
        // Fetch product details
        const { data: productData } = await axios.get(`${API_URL}/products/${productId}`);
        const product = productData.product;
        
        if (!product || !product.isActive) {
          return rejectWithValue('Product not found');
        }
        
        let guestCart = getGuestCart();
        
        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex(
          item => item.productId === productId && 
          JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
        );
        
        if (existingItemIndex > -1) {
          // Update quantity
          const newQuantity = (guestCart.items[existingItemIndex].quantity || 1) + quantity;
          if (newQuantity > product.stock) {
            return rejectWithValue('Insufficient stock');
          }
          guestCart.items[existingItemIndex].quantity = newQuantity;
        } else {
          // Add new item
          guestCart.items.push({
            productId,
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              stock: product.stock
            },
            quantity,
            variant: variant || {}
          });
        }
        
        guestCart.lastUpdated = new Date().toISOString();
        saveGuestCart(guestCart);
        
        return { ...guestCart, isGuest: true };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
      }
    }
    
    // Authenticated user - use API
    try {
      const { data } = await axios.post(
        `${API_URL}/cart`,
        { productId, quantity, variant },
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Update cart item (works for both authenticated and guest users)
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Guest cart update
      let guestCart = getGuestCart();
      const itemIndex = guestCart.items.findIndex(item => item.productId === itemId || item._id === itemId);
      
      if (itemIndex === -1) {
        return rejectWithValue('Item not found');
      }
      
      if (quantity < 1) {
        guestCart.items.splice(itemIndex, 1);
      } else {
        guestCart.items[itemIndex].quantity = quantity;
      }
      
      guestCart.lastUpdated = new Date().toISOString();
      saveGuestCart(guestCart);
      
      return { ...guestCart, isGuest: true };
    }
    
    try {
      const { data } = await axios.put(
        `${API_URL}/cart/${itemId}`,
        { quantity },
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

// Remove from cart (works for both authenticated and guest users)
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Guest cart remove
      let guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(item => 
        item.productId !== itemId && item._id !== itemId
      );
      guestCart.lastUpdated = new Date().toISOString();
      saveGuestCart(guestCart);
      
      return { ...guestCart, isGuest: true };
    }
    
    try {
      const { data } = await axios.delete(
        `${API_URL}/cart/${itemId}`,
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Clear cart (works for both authenticated and guest users)
export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Clear guest cart
    saveGuestCart({ items: [], lastUpdated: new Date().toISOString() });
    return { items: [], isGuest: true };
  }
  
  try {
    const { data } = await axios.delete(`${API_URL}/cart`, { headers: getAuthHeaders() });
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

// Sync guest cart to backend when user logs in
export const syncGuestCart = createAsyncThunk(
  'cart/syncGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      const guestCart = getGuestCart();
      
      if (!guestCart.items || guestCart.items.length === 0) {
        // No guest cart items, just fetch user cart
        const { data } = await axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
        return data.cart;
      }
      
      // Add all guest cart items to backend cart
      for (const item of guestCart.items) {
        try {
          await axios.post(
            `${API_URL}/cart`,
            {
              productId: item.productId || item.product?._id,
              quantity: item.quantity,
              variant: item.variant
            },
            { headers: getAuthHeaders() }
          );
        } catch (error) {
          console.error('Error syncing cart item:', error);
          // Continue with other items even if one fails
        }
      }
      
      // Clear guest cart after sync
      saveGuestCart({ items: [] });
      
      // Fetch updated cart
      const { data } = await axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

const initialState = {
  cart: null,
  loading: false,
  error: null
};

// Initialize cart from localStorage if user is not authenticated
const initializeCart = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const guestCart = getGuestCart();
    return { ...guestCart, isGuest: true };
  }
  return null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    cart: initializeCart()
  },
  reducers: {
    initializeGuestCart: (state) => {
      if (!localStorage.getItem('token')) {
        const guestCart = getGuestCart();
        state.cart = { ...guestCart, isGuest: true };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        // On error, try to load guest cart if not authenticated
        if (!localStorage.getItem('token')) {
          const guestCart = getGuestCart();
          state.cart = { ...guestCart, isGuest: true };
        }
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(syncGuestCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  }
});

export const { initializeGuestCart } = cartSlice.actions;
export default cartSlice.reducer;

// Export helper function for getting cart item count
export const getCartItemCount = (state) => {
  if (state.cart.cart) {
    if (state.cart.cart.isGuest) {
      return state.cart.cart.items ? state.cart.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    }
    return state.cart.cart.items ? state.cart.cart.items.length : 0;
  }
  return 0;
};

import { API_URL } from '../../utils/api.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Guest cart helper functions
const GUEST_CART_KEY = 'waterjunction_guest_cart';

const getGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : { items: [] };
  } catch (error) {
    return { items: [] };
  }
};

const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
};

const getGuestCartItemCount = () => {
  const cart = getGuestCart();
  return cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
};

// Track ongoing requests to prevent duplicates
let cartFetchPromise = null;

// Fetch cart (authenticated users) or guest cart
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue, getState }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Return guest cart
    const guestCart = getGuestCart();
    return { ...guestCart, isGuest: true };
  }
  
  // If there's already a pending request, return it
  if (cartFetchPromise) {
    try {
      return await cartFetchPromise;
    } catch (error) {
      // If the pending request fails, allow a new one
      cartFetchPromise = null;
      throw error;
    }
  }
  
  try {
    cartFetchPromise = axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
    const { data } = await cartFetchPromise;
    cartFetchPromise = null;
    return data.cart;
  } catch (error) {
    cartFetchPromise = null;
    // For rate limit errors, return guest cart instead of rejecting
    if (error.response?.status === 429) {
      console.warn('Rate limited on cart fetch, using cached/guest cart');
      const guestCart = getGuestCart();
      return { ...guestCart, isGuest: true };
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

// Add to cart (works for both authenticated and guest users)
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, variant }, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    // If not authenticated, use guest cart
    if (!token) {
      try {
        // Fetch product details
        const { data: productData } = await axios.get(`${API_URL}/products/${productId}`);
        const product = productData.product;
        
        if (!product || !product.isActive) {
          return rejectWithValue('Product not found');
        }
        
        let guestCart = getGuestCart();
        
        // Check if item already exists
        const existingItemIndex = guestCart.items.findIndex(
          item => item.productId === productId && 
          JSON.stringify(item.variant || {}) === JSON.stringify(variant || {})
        );
        
        if (existingItemIndex > -1) {
          // Update quantity
          const newQuantity = (guestCart.items[existingItemIndex].quantity || 1) + quantity;
          if (newQuantity > product.stock) {
            return rejectWithValue('Insufficient stock');
          }
          guestCart.items[existingItemIndex].quantity = newQuantity;
        } else {
          // Add new item
          guestCart.items.push({
            productId,
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              stock: product.stock
            },
            quantity,
            variant: variant || {}
          });
        }
        
        guestCart.lastUpdated = new Date().toISOString();
        saveGuestCart(guestCart);
        
        return { ...guestCart, isGuest: true };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
      }
    }
    
    // Authenticated user - use API
    try {
      const { data } = await axios.post(
        `${API_URL}/cart`,
        { productId, quantity, variant },
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

// Update cart item (works for both authenticated and guest users)
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Guest cart update
      let guestCart = getGuestCart();
      const itemIndex = guestCart.items.findIndex(item => item.productId === itemId || item._id === itemId);
      
      if (itemIndex === -1) {
        return rejectWithValue('Item not found');
      }
      
      if (quantity < 1) {
        guestCart.items.splice(itemIndex, 1);
      } else {
        guestCart.items[itemIndex].quantity = quantity;
      }
      
      guestCart.lastUpdated = new Date().toISOString();
      saveGuestCart(guestCart);
      
      return { ...guestCart, isGuest: true };
    }
    
    try {
      const { data } = await axios.put(
        `${API_URL}/cart/${itemId}`,
        { quantity },
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

// Remove from cart (works for both authenticated and guest users)
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue, getState }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Guest cart remove
      let guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(item => 
        item.productId !== itemId && item._id !== itemId
      );
      guestCart.lastUpdated = new Date().toISOString();
      saveGuestCart(guestCart);
      
      return { ...guestCart, isGuest: true };
    }
    
    try {
      const { data } = await axios.delete(
        `${API_URL}/cart/${itemId}`,
        { headers: getAuthHeaders() }
      );
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

// Clear cart (works for both authenticated and guest users)
export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Clear guest cart
    saveGuestCart({ items: [], lastUpdated: new Date().toISOString() });
    return { items: [], isGuest: true };
  }
  
  try {
    const { data } = await axios.delete(`${API_URL}/cart`, { headers: getAuthHeaders() });
    return data.cart;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

// Sync guest cart to backend when user logs in
export const syncGuestCart = createAsyncThunk(
  'cart/syncGuestCart',
  async (_, { rejectWithValue }) => {
    try {
      const guestCart = getGuestCart();
      
      if (!guestCart.items || guestCart.items.length === 0) {
        // No guest cart items, just fetch user cart
        const { data } = await axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
        return data.cart;
      }
      
      // Add all guest cart items to backend cart
      for (const item of guestCart.items) {
        try {
          await axios.post(
            `${API_URL}/cart`,
            {
              productId: item.productId || item.product?._id,
              quantity: item.quantity,
              variant: item.variant
            },
            { headers: getAuthHeaders() }
          );
        } catch (error) {
          console.error('Error syncing cart item:', error);
          // Continue with other items even if one fails
        }
      }
      
      // Clear guest cart after sync
      saveGuestCart({ items: [] });
      
      // Fetch updated cart
      const { data } = await axios.get(`${API_URL}/cart`, { headers: getAuthHeaders() });
      return data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

const initialState = {
  cart: null,
  loading: false,
  error: null
};

// Initialize cart from localStorage if user is not authenticated
const initializeCart = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const guestCart = getGuestCart();
    return { ...guestCart, isGuest: true };
  }
  return null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    cart: initializeCart()
  },
  reducers: {
    initializeGuestCart: (state) => {
      if (!localStorage.getItem('token')) {
        const guestCart = getGuestCart();
        state.cart = { ...guestCart, isGuest: true };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        // On error, try to load guest cart if not authenticated
        if (!localStorage.getItem('token')) {
          const guestCart = getGuestCart();
          state.cart = { ...guestCart, isGuest: true };
        }
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(syncGuestCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  }
});

export const { initializeGuestCart } = cartSlice.actions;
export default cartSlice.reducer;

// Export helper function for getting cart item count
export const getCartItemCount = (state) => {
  if (state.cart.cart) {
    if (state.cart.cart.isGuest) {
      return state.cart.cart.items ? state.cart.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    }
    return state.cart.cart.items ? state.cart.cart.items.length : 0;
  }
  return 0;
};
