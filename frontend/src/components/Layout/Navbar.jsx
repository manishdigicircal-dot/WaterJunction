import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { getCartItemCount } from '../../store/slices/cartSlice';
// REMOVED: fetchCart, fetchWishlist imports - App.jsx handles these to prevent duplicate calls
import { setLanguage } from '../../store/slices/languageSlice';
import { getTranslation } from '../../utils/translations';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiSearch,
  FiHome,
  FiGrid,
  FiTag,
  FiMail,
  FiSettings,
  FiLogOut,
  FiGlobe
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '../../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { language } = useSelector((state) => state.language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarKey, setAvatarKey] = useState(0);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Calculate cart item count (works for both authenticated and guest users)
  const cartItemCount = useSelector((state) => {
    if (state.cart.cart) {
      if (state.cart.cart.isGuest) {
        return state.cart.cart.items ? state.cart.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
      }
      return state.cart.cart.items ? state.cart.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
    }
    return 0;
  });
  
  const wishlistCount = wishlist?.items?.length || 0;

  // REMOVED: Duplicate API calls - App.jsx already handles fetchCart/fetchWishlist on mount
  // Navbar should only display data from Redux store, not fetch it
  // This prevents duplicate API calls and improves performance

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products with debounce
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchProducts();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    try {
      setIsSearching(true);
      const { data } = await axios.get(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
      setSearchResults(data.products || []);
      setShowSearchDropdown(data.products && data.products.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Bump avatar cache key when profile photo changes
  useEffect(() => {
    if (user?.profilePhoto) {
      setAvatarKey(Date.now());
    }
  }, [user?.profilePhoto]);

  const getAvatarSrc = () => {
    const raw = user?.profilePhoto;
    if (!raw) return null;
    const photo = raw.trim();
    if (!photo) return null;
    if (photo.startsWith('data:image')) return photo.split('?')[0];
    return `${photo}${photo.includes('?') ? '&' : '?'}v=${avatarKey || Date.now()}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleSearchResultClick = (product) => {
    navigate(`/products/${product._id}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success(getTranslation('logout', language));
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error(getTranslation('error', language));
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    dispatch(setLanguage(newLang));
  };

  return (
    <nav className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 text-white shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <img 
              src="/images/logo-waterjuction.webp" 
              alt="Water Junction Logo" 
              className="h-10 md:h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                if (!e.target.nextSibling) {
                  const fallback = document.createElement('span');
                  fallback.className = 'text-3xl';
                  fallback.textContent = '💧';
                  e.target.parentElement.insertBefore(fallback, e.target);
                }
              }}
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getTranslation('search', language) || 'Search products...'}
                  className="w-full px-4 pl-10 pr-10 py-2 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-primary-600 transition"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-1 rounded-full transition-colors text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="p-2 text-xs font-semibold text-gray-500 uppercase border-b">
                      Search Results
                    </div>
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSearchResultClick(product)}
                        className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-primary-600 font-semibold">
                            ₹{product.price?.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearch}
                      className="w-full p-3 text-center text-primary-600 font-semibold hover:bg-gray-50 border-t"
                    >
                      View All Results →
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Navigation Links */}
            <Link 
              to="/" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Home"
            >
              <FiHome className="text-lg" />
              <span className="hidden lg:inline">{getTranslation('home', language)}</span>
            </Link>
            
            <Link 
              to="/products" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Products"
            >
              <FiGrid className="text-lg" />
              <span className="hidden lg:inline">{getTranslation('products', language)}</span>
            </Link>
            
            <Link 
              to="/categories" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Categories"
            >
              <FiTag className="text-lg" />
              <span className="hidden lg:inline">{getTranslation('categories', language)}</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Contact"
            >
              <FiMail className="text-lg" />
              <span className="hidden lg:inline">{getTranslation('contact', language)}</span>
            </Link>

            {/* Cart & Wishlist */}
            {/* Cart icon - always visible for both authenticated and guest users */}
            <Link 
              to="/cart" 
              className="relative flex items-center px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Cart"
            >
              <FiShoppingCart className="text-xl" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Wishlist - only visible for authenticated users */}
            {isAuthenticated && (
              <Link 
                to="/wishlist" 
                className="relative flex items-center px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
                title="Wishlist"
              >
                <FiHeart className="text-xl" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-primary-500 transition-colors"
              title="Change Language"
            >
              <FiGlobe className="text-lg" />
              <span className="hidden lg:inline">{language === 'en' ? 'हिंदी' : 'English'}</span>
              <span className="lg:hidden">{language === 'en' ? 'हिं' : 'EN'}</span>
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-primary-500">
                <Link 
                  to="/profile" 
                  onClick={(e) => {
                    // Prevent any event propagation issues
                    e.stopPropagation();
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:ring-2 hover:ring-primary-200 transition shadow-sm overflow-hidden cursor-pointer"
                  title={user?.name || getTranslation('profile', language)}
                >
                  {user?.profilePhoto ? (
                    <img
                      key={avatarKey}
                      src={getAvatarSrc()}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover pointer-events-none"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-sm font-semibold pointer-events-none">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-primary-500 transition-colors bg-primary-800 text-white"
                    title="Admin Panel"
                  >
                    <FiSettings className="text-lg" />
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-red-600 transition-colors text-white bg-red-500"
                  title="Logout"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-primary-500">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
                >
                  {getTranslation('login', language)}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors font-medium shadow-md"
                >
                  {getTranslation('register', language)}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-primary-500 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden py-3 border-t border-primary-500">
          <form onSubmit={handleSearch} className="relative" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation('search', language) || 'Search products...'}
              className="w-full px-4 pl-10 pr-20 py-2 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              Search
            </button>
          </form>

          {/* Mobile Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-4 right-4 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSearchResultClick(product)}
                      className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                    >
                      <img
                        src={product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-primary-600 font-semibold">
                          ₹{product.price?.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full p-3 text-center text-primary-600 font-semibold hover:bg-gray-50 border-t"
                  >
                    View All →
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-primary-500">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FiHome />
              <span>{getTranslation('home', language)}</span>
            </Link>
            
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FiGrid />
              <span>{getTranslation('products', language)}</span>
            </Link>
            
            <Link 
              to="/categories" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FiTag />
              <span>{getTranslation('categories', language)}</span>
            </Link>
            
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <FiMail />
              <span>{getTranslation('contact', language)}</span>
            </Link>

            {/* Cart - always visible for both authenticated and guest users */}
            <Link 
              to="/cart" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FiShoppingCart />
                <span>{getTranslation('cart', language)}</span>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Wishlist - only visible for authenticated users */}
            {isAuthenticated && (
              <>
                <Link 
                  to="/wishlist" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FiHeart />
                    <span>{getTranslation('wishlist', language)}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors"
                >
                  <FiUser />
                  <span>{getTranslation('profile', language)}</span>
                </Link>
                
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors bg-primary-800"
                  >
                    <FiSettings />
                    <span>{getTranslation('admin', language)}</span>
                  </Link>
                )}
              </>
            )}
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full text-left"
            >
              <FiGlobe />
              <span>{language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}</span>
            </button>
            
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-600 transition-colors w-full text-left"
              >
                <FiLogOut />
                <span>{getTranslation('logout', language)}</span>
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors text-center"
                >
                  {getTranslation('login', language)}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-primary-500 px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors text-center font-medium"
                >
                  {getTranslation('register', language)}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
