import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import { fetchCart, initializeGuestCart } from './store/slices/cartSlice';
import { fetchWishlist } from './store/slices/wishlistSlice';

// Layouts
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Layout/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OTPLogin from './pages/Auth/OTPLogin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// User Pages
import Profile from './pages/User/Profile';
import Orders from './pages/User/Orders';
import OrderDetails from './pages/User/OrderDetails';
import Cart from './pages/User/Cart';
import Checkout from './pages/User/Checkout';
import ThankYou from './pages/User/ThankYou';
import PaymentFailed from './pages/User/PaymentFailed';
import Wishlist from './pages/User/Wishlist';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminCategories from './pages/Admin/Categories';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import AdminCoupons from './pages/Admin/Coupons';
import AdminReviews from './pages/Admin/Reviews';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, user } = useSelector((state) => state.auth);
  
  // Show loading only if we're actively loading AND have a token
  // Don't show loading if we have a user (even if isAuthenticated is false due to rate limit)
  if (loading && token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  // If we have a token and user, consider authenticated (even if isAuthenticated is false due to rate limit)
  if (token && user) {
    return children;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading, token } = useSelector((state) => state.auth);
  
  // Show loading while checking authentication
  if (loading || (token && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await dispatch(getMe()).unwrap();
          dispatch(fetchCart());
          dispatch(fetchWishlist());
        } catch (error) {
          // Only clear token if it's a 401 error, not rate limit
          if (error === 'RATE_LIMITED') {
            console.warn('Rate limited during auth initialization');
            // Still initialize cart as guest
            dispatch(initializeGuestCart());
            dispatch(fetchCart());
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch(initializeGuestCart());
            dispatch(fetchCart());
          }
        }
      } else {
        // No token, initialize guest cart
        dispatch(initializeGuestCart());
        dispatch(fetchCart());
      }
      setAuthChecked(true);
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="login/otp" element={<OTPLogin />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* Protected User Routes */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="thank-you/:orderId"
            element={
              <ProtectedRoute>
                <ThankYou />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment-failed"
            element={
              <ProtectedRoute>
                <PaymentFailed />
              </ProtectedRoute>
            }
          />
          <Route
            path="wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

