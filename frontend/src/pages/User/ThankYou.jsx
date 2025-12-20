import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiShoppingBag, FiUser, FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
// // Using native Date methods instead of date-fns // Removed date-fns dependency

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ThankYou = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;
  const shipping = order.shippingFee || 0;
  const discount = order.discount || 0;
  const total = order.totalAmount || subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
            <FiCheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🎉 Payment Successful!</h1>
          <p className="text-xl md:text-2xl opacity-90">Thank you for your order!</p>
          <p className="mt-2 text-lg opacity-80">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPackage className="text-green-500" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={item.product?.images?.[0] || '/images/placeholder.png'}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{shipping.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* User Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiUser className="text-blue-500" />
              Your Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiUser className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{user?.name || order.shippingAddress?.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMail className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiPhone className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{user?.phone || order.shippingAddress?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMapPin className="text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="font-semibold text-gray-800">
                    {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <FiTruck className="text-green-600" />
                <span className="font-semibold">Order Status: {order.status?.toUpperCase()}</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Order placed on {new Date(order.createdAt).toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/orders/${orderId}`}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2"
            >
              <FiPackage />
              View Order Details
            </Link>
            <Link
              to="/orders"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2"
            >
              <FiShoppingBag />
              All Orders
            </Link>
            <Link
              to="/products"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2"
            >
              <FiHome />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Beautiful Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">WaterJunction</h3>
              <p className="text-gray-400">Your trusted partner for pure water solutions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Products</Link></li>
                <li><Link to="/orders" className="hover:text-white transition">Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Order Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Order #: {order.orderNumber}</li>
                <li>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}</li>
                <li>Status: <span className="text-green-400">{order.status}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} WaterJunction. All rights reserved. | Designed & Developed with ❤️ by 
<a href="https://digicircal.com" target="_blank" rel="noopener">Digicircal</a>
</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;

