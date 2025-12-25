import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, setCredentials } from '../../store/slices/authSlice';
import { syncGuestCart } from '../../store/slices/cartSlice';
import { getTranslation } from '../../utils/translations';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

import { API_URL } from '../../utils/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      // Sync guest cart to backend after login
      try {
        await dispatch(syncGuestCart()).unwrap();
      } catch (cartError) {
        console.error('Cart sync error:', cartError);
      }
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (response) => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google OAuth not configured');
      return;
    }
    try {
      // Decode Google ID token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const userInfo = JSON.parse(jsonPayload);

      const { data } = await axios.post(`${API_URL}/auth/google`, {
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        profilePhoto: userInfo.picture
      });

      dispatch(setCredentials({ user: data.user, token: data.token }));
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      // Sync guest cart to backend after Google login
      try {
        await dispatch(syncGuestCart()).unwrap();
      } catch (cartError) {
        console.error('Cart sync error:', cartError);
      }
      toast.success('Logged in with Google!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  const handleFacebookLogin = () => {
    // Initialize Facebook SDK if not already loaded
    if (!window.FB) {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        triggerFacebookLogin();
      };
      document.body.appendChild(script);
    } else {
      triggerFacebookLogin();
    }
  };

  const triggerFacebookLogin = () => {
    window.FB.login((response) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo) => {
          try {
            const { data } = await axios.post(`${API_URL}/auth/facebook`, {
              facebookId: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              profilePhoto: userInfo.picture?.data?.url
            });
            dispatch(setCredentials({ user: data.user, token: data.token }));
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            // Sync guest cart to backend after Facebook login
            try {
              await dispatch(syncGuestCart()).unwrap();
            } catch (cartError) {
              console.error('Cart sync error:', cartError);
            }
            toast.success('Logged in with Facebook!');
            navigate('/');
          } catch (error) {
            toast.error(error.response?.data?.message || 'Facebook login failed');
          }
        });
      } else {
        toast.error('Facebook login cancelled');
      }
    }, { scope: 'email' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient)" opacity="0.4"></path>
          <path d="M0,500 C300,400 600,600 900,500 C1050,450 1125,550 1200,500 L1200,800 L0,800 Z" fill="url(#wave-gradient)" opacity="0.3"></path>
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-2xl ring-4 ring-cyan-100">
                  💧
                </div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Sign in to your Water Junction account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getTranslation('email', language)}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getTranslation('password', language)}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cyan-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                {getTranslation('forgotPassword', language)}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  getTranslation('login', language)
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            {/* Google Login */}
            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <div className="flex justify-center">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login failed')}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>
              </div>
            )}

            {/* Facebook Login */}
            {import.meta.env.VITE_FACEBOOK_APP_ID && (
              <button
                onClick={handleFacebookLogin}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#1877F2] text-white font-semibold rounded-xl hover:bg-[#166FE5] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            )}
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
              {getTranslation('register', language)}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

