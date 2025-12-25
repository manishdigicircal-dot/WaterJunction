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

        return {
          cart: guestCart,
          isGuest: true,
          message: 'Item added to guest cart'
        };

      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add item to guest cart');
      }
    }

    // If authenticated, use server cart
    try {
      const { data } = await axios.post(`${API_URL}/cart`, {
        productId,
        quantity,
        variant
      }, { headers: getAuthHeaders() });

      return {
        cart: data.cart,
        isGuest: false,
        message: data.message
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, isGuest }, { rejectWithValue }) => {
    if (isGuest) {
      // Update guest cart
      try {
        let guestCart = getGuestCart();
        const itemIndex = guestCart.items.findIndex(item => item.productId === itemId);

        if (itemIndex === -1) {
          return rejectWithValue('Item not found in cart');
        }

        if (quantity <= 0) {
          guestCart.items.splice(itemIndex, 1);
        } else {
          // Fetch product to check stock
          const { data: productData } = await axios.get(`${API_URL}/products/${itemId}`);
          const product = productData.product;

          if (quantity > product.stock) {
            return rejectWithValue('Insufficient stock');
          }

          guestCart.items[itemIndex].quantity = quantity;
        }

        guestCart.lastUpdated = new Date().toISOString();
        saveGuestCart(guestCart);

        return { cart: guestCart, isGuest: true };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update guest cart');
      }
    }

    // Update server cart
    try {
      const { data } = await axios.put(`${API_URL}/cart/${itemId}`, {
        quantity
      }, { headers: getAuthHeaders() });

      return { cart: data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

// Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ itemId, isGuest }, { rejectWithValue }) => {
    if (isGuest) {
      // Remove from guest cart
      let guestCart = getGuestCart();
      guestCart.items = guestCart.items.filter(item => item.productId !== itemId);
      guestCart.lastUpdated = new Date().toISOString();
      saveGuestCart(guestCart);

      return { cart: guestCart, isGuest: true };
    }

    // Remove from server cart
    try {
      const { data } = await axios.delete(`${API_URL}/cart/${itemId}`, {
        headers: getAuthHeaders()
      });

      return { cart: data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async ({ isGuest }, { rejectWithValue }) => {
    if (isGuest) {
      // Clear guest cart
      const emptyCart = { items: [], lastUpdated: new Date().toISOString() };
      saveGuestCart(emptyCart);
      return { cart: emptyCart, isGuest: true };
    }

    // Clear server cart
    try {
      const { data } = await axios.delete(`${API_URL}/cart`, {
        headers: getAuthHeaders()
      });

      return { cart: data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    isGuest: false
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    initializeGuestCart: (state) => {
      const guestCart = getGuestCart();
      state.items = guestCart.items || [];
      state.isGuest = true;
      state.total = calculateTotal(guestCart.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.isGuest = action.payload.isGuest || false;
        state.total = calculateTotal(action.payload.items);
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items || [];
        state.isGuest = action.payload.isGuest;
        state.total = calculateTotal(action.payload.cart.items);
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items || [];
        state.isGuest = action.payload.isGuest;
        state.total = calculateTotal(action.payload.cart.items);
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items || [];
        state.isGuest = action.payload.isGuest;
        state.total = calculateTotal(action.payload.cart.items);
        state.error = null;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart.items || [];
        state.isGuest = action.payload.isGuest;
        state.total = calculateTotal(action.payload.cart.items);
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to calculate total
const calculateTotal = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);
};

export const { clearCartError, initializeGuestCart } = cartSlice.actions;
export default cartSlice.reducer;

