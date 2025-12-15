import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { getTranslation } from '../../utils/translations';
import toast from 'react-hot-toast';
import { FiTrash2, FiShoppingCart, FiHeart, FiArrowRight, FiTag } from 'react-icons/fi';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { wishlist, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (itemId) => {
    try {
      await dispatch(removeFromWishlist(itemId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error || 'Failed to remove');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
        {/* Water Wave Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-wishlist)" opacity="0.4"></path>
            <defs>
              <linearGradient id="wave-gradient-wishlist" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto text-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8">Start adding products you love to your wishlist!</p>
            <Link 
              to="/products" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiArrowRight className="w-5 h-5" />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-wishlist-main)" opacity="0.4"></path>
          <defs>
            <linearGradient id="wave-gradient-wishlist-main" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 flex items-center">
            <FiHeart className="text-pink-500 mr-3" />
            My Wishlist
          </h1>
          <p className="text-gray-600">{wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'} saved</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.items.map((item) => {
            const product = item.product || {};
            const discount = product.mrp > product.price 
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
              : 0;

            return (
              <div 
                key={item._id} 
                className="group bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 transform hover:scale-110"
                  title="Remove from wishlist"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>

                {/* Product Image */}
                <Link to={`/products/${product._id}`} className="block relative">
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg">
                        <FiTag className="w-3 h-3" />
                        <span>{discount}% OFF</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>

                {/* Product Details */}
                <div className="p-5">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-cyan-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-extrabold text-cyan-600">
                      ₹{product.price?.toLocaleString() || '0'}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-gray-500 line-through text-sm">
                        ₹{product.mrp?.toLocaleString() || '0'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                    <Link
                      to={`/products/${product._id}`}
                      className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>View Details</span>
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-gray-700 font-semibold rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <FiArrowRight className="w-5 h-5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
