import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';
import { getTranslation } from '../../utils/translations';
import toast from 'react-hot-toast';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiShoppingCart, FiTruck, FiCheckCircle, FiX } from 'react-icons/fi';

const Cart = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { cart, loading } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const itemId = item._id || item.productId || item.product?._id;
      await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error || 'Failed to update cart');
    }
  };

  const handleRemove = async (item) => {
    try {
      const itemId = item._id || item.productId || item.product?._id;
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
        {/* Water Wave Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-cart)" opacity="0.4"></path>
            <defs>
              <linearGradient id="wave-gradient-cart" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-md mx-auto text-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="w-12 h-12 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const product = item.product || {};
    const price = product.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const shipping = 0; // Free shipping for all orders
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-cart-main)" opacity="0.4"></path>
          <defs>
            <linearGradient id="wave-gradient-cart-main" x1="0%" y1="0%" x2="100%" y2="0%">
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
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item, index) => {
              const product = item.product || {};
              const productId = product._id || item.productId;
              const itemId = item._id || item.productId || productId;
              const productPrice = product.price || 0;
              const itemTotal = productPrice * (item.quantity || 1);
              
              return (
                <div 
                  key={itemId || index} 
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4 md:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <Link to={`/products/${productId}`} className="flex-shrink-0">
                      <div className="relative w-full md:w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group">
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/products/${productId}`}>
                          <h3 className="font-bold text-lg text-gray-900 hover:text-cyan-600 transition-colors mb-2">
                            {product.name || 'Product'}
                          </h3>
                        </Link>
                        <p className="text-2xl font-bold text-cyan-600 mb-4">
                          ₹{productPrice.toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => handleUpdateQuantity(item, (item.quantity || 1) - 1)}
                              className="p-2 md:p-3 hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 md:px-6 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, (item.quantity || 1) + 1)}
                              className="p-2 md:p-3 hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 transition-colors"
                            >
                              <FiPlus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-900">₹{itemTotal.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-110"
                          title="Remove from cart"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiShoppingBag className="text-cyan-600 mr-2" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center">
                    <FiTruck className="w-4 h-4 mr-1" />
                    Shipping
                  </span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600 flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Free
                      </span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>


                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%)</span>
                  <span className="font-semibold">₹{tax.toLocaleString()}</span>
                </div>

                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>


              <Link
                to="/checkout"
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </Link>

              <Link
                to="/products"
                className="w-full mt-3 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
