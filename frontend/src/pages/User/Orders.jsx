import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getTranslation } from '../../utils/translations';
import { format } from 'date-fns';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiArrowRight, FiMapPin, FiCalendar } from 'react-icons/fi';

import { API_URL } from '../../utils/api';

const Orders = () => {
  const { language } = useSelector((state) => state.language);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: FiClock,
        bgGradient: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200'
      },
      paid: {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: FiCheckCircle,
        bgGradient: 'from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200'
      },
      packed: {
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: FiPackage,
        bgGradient: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-200'
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        icon: FiTruck,
        bgGradient: 'from-indigo-50 to-blue-50',
        borderColor: 'border-indigo-200'
      },
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: FiCheckCircle,
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: FiXCircle,
        bgGradient: 'from-red-50 to-pink-50',
        borderColor: 'border-red-200'
      },
      returned: {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: FiPackage,
        bgGradient: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200'
      }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-orders)" opacity="0.4"></path>
          <defs>
            <linearGradient id="wave-gradient-orders" x1="0%" y1="0%" x2="100%" y2="0%">
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
            My Orders
          </h1>
          <p className="text-gray-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'} found</p>
        </div>

        {orders.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage className="w-12 h-12 text-cyan-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
            <Link 
              to="/products" 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiArrowRight className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={order._id} 
                  className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 ${statusConfig.borderColor} overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {/* Order Header */}
                  <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-6 border-b-2 ${statusConfig.borderColor}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${statusConfig.color} bg-white`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              {format(new Date(order.createdAt), 'PPp')}
                            </span>
                            {order.shippingAddress && (
                              <span className="flex items-center">
                                <FiMapPin className="w-4 h-4 mr-1" />
                                {order.shippingAddress.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${statusConfig.color} bg-white`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-colors"
                        >
                          <Link to={`/products/${item.product?._id || item.productId}`} className="flex-shrink-0">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 group">
                              <img
                                src={item.image || item.product?.images?.[0] || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src = '/placeholder.jpg';
                                }}
                              />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link to={`/products/${item.product?._id || item.productId}`}>
                              <h4 className="font-semibold text-gray-900 hover:text-cyan-600 transition-colors truncate">
                                {item.name}
                              </h4>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: <span className="font-semibold">{item.quantity}</span> × ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t-2 border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="text-2xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            ₹{order.total.toLocaleString()}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FiTruck className="w-4 h-4 text-cyan-600" />
                            <span className="text-gray-600">Tracking:</span>
                            <span className="font-semibold text-gray-900">{order.trackingNumber}</span>
                          </div>
                        )}
                        {order.paymentMethod && (
                          <div className="text-sm text-gray-600">
                            Payment: <span className="font-semibold">{order.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span>View Details</span>
                          <FiArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
