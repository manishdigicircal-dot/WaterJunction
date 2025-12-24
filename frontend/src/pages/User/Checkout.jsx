import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCart } from '../../store/slices/cartSlice';
import { getMe } from '../../store/slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getTranslation } from '../../utils/translations';
import { FiMapPin, FiCreditCard, FiShoppingBag, FiPlus, FiCheck, FiLock, FiTruck, FiShield } from 'react-icons/fi';

import { API_URL } from '../../utils/api';
// Razorpay Live Key - Must be set via VITE_RAZORPAY_KEY_ID env variable
const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_RtlA2dF0qpGDAo';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true
  });

  const hasInitialized = useRef(false);
  
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const loadData = async () => {
      try {
        hasInitialized.current = true;
        await Promise.all([
          dispatch(fetchCart()).catch(err => {
            if (err.response?.status === 429) {
              console.warn('Rate limited on cart fetch, will retry later');
              return null;
            }
            throw err;
          }),
          dispatch(getMe())
            .unwrap()
            .catch(err => {
              // Handle rate limit errors
              if (err === 'RATE_LIMITED' || err.response?.status === 429) {
                console.warn('Rate limited on getMe, will retry later');
                return null;
              }
              throw err;
            })
        ]);
      } catch (error) {
        console.error('Error loading checkout data:', error);
        // Don't show error toast for rate limits, just log
        if (error.response?.status !== 429) {
          toast.error('Failed to load checkout data. Please refresh.');
        }
      }
    };
    
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedAddress(defaultAddress);
      setShowAddressForm(false);
    } else {
      setShowAddressForm(true);
    }
  }, [user]);

  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (window.Razorpay) {
        setRazorpayReady(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayReady(true);
      script.onerror = () => {
        setRazorpayReady(false);
        toast.error('Failed to load payment gateway. Please refresh.');
      };
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/users/address`,
        addressForm,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Address saved successfully!');
      dispatch(getMe());
      setSelectedAddress(data.addresses[data.addresses.length - 1]);
      setShowAddressForm(false);
      setAddressForm({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: true
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please add a shipping address');
      return;
    }

    // Validate address has all required fields
    const requiredFields = ['name', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !selectedAddress[field]);
    if (missingFields.length > 0) {
      toast.error(`Please complete address: ${missingFields.join(', ')}`);
      return;
    }

    // Validate cart
    if (!cart || !cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty. Please add items to cart first.');
      // Refresh cart
      await dispatch(fetchCart());
      return;
    }

    // Validate cart items have products
    const validItems = cart.items.filter(item => item.product && item.product._id);
    if (validItems.length === 0) {
      toast.error('Cart items are invalid. Please refresh your cart.');
      await dispatch(fetchCart());
      return;
    }

    // Check Razorpay key
    if (!RAZORPAY_KEY_ID) {
      toast.error('Payment gateway not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      // Refresh cart before placing order to ensure it's up to date
      await dispatch(fetchCart());
      
      const { data } = await axios.post(
        `${API_URL}/orders`,
        {
          shippingAddress: selectedAddress,
          paymentMethod: 'razorpay'
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (data.razorpayOrder) {
        if (!razorpayReady) {
          toast.error('Payment gateway not ready. Please wait or refresh.');
          setLoading(false);
          return;
        }
        
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          order_id: data.razorpayOrder.id,
          name: 'WaterJunction',
          description: 'Order Payment',
          handler: async (response) => {
            try {
              await axios.post(
                `${API_URL}/orders/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: data.order._id
                },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
              );
              toast.success('Payment successful!');
              navigate(`/thank-you/${data.order._id}`);
            } catch (error) {
              toast.error('Payment verification failed');
              navigate('/payment-failed');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone || selectedAddress?.phone || ''
          },
          theme: {
            color: '#0ea5e9'
          }
        };

        if (window.Razorpay) {
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.on('payment.failed', function (response) {
            console.error('Payment failed:', response);
            toast.error('Payment failed. Please try again.');
            navigate('/payment-failed');
          });
          razorpayInstance.open();
        } else {
          toast.error('Razorpay SDK not loaded. Please refresh the page.');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      toast.error(errorMessage);
      console.error('Order error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading your cart...</h2>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Filter out invalid items and safely calculate totals
  const validItems = cart.items.filter(item => item && item.product && item.product._id);
  
  if (validItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Cart Items</h2>
          <p className="text-gray-600 mb-4">Your cart contains invalid items. Please refresh your cart.</p>
          <button
            onClick={() => {
              dispatch(fetchCart());
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Refresh Cart
          </button>
        </div>
      </div>
    );
  }

  // Safely calculate totals with error handling
  const subtotal = validItems.reduce((sum, item) => {
    try {
      const price = typeof item.product?.price === 'number' ? item.product.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return sum + (price * quantity);
    } catch (error) {
      console.error('Error calculating item total:', error, item);
      return sum;
    }
  }, 0);
  const shipping = 0; // Free shipping for all orders
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600">Complete your order in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white">
                  <FiMapPin className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Address</h2>
                  <p className="text-gray-500 text-sm">Where should we deliver your order?</p>
                </div>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter recipient name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                        pattern="[0-9]{10}"
                        maxLength="10"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                    <input
                      type="text"
                      placeholder="House/Flat No., Building Name"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                    <input
                      type="text"
                      placeholder="Street, Area, Landmark (Optional)"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                        pattern="[0-9]{6}"
                        maxLength="6"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingAddress ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="text-xl" />
                        Save Address
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {user?.addresses?.map((address) => (
                    <label
                      key={address._id}
                      className={`block p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? 'border-cyan-500 bg-cyan-50/50 shadow-md'
                          : 'border-gray-200 hover:border-cyan-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address._id}
                        checked={selectedAddress?._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                        className="mr-3"
                      />
                      <div className="inline-block">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-gray-800">{address.name}</p>
                          {address.isDefault && (
                            <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-1">{address.addressLine1}</p>
                        {address.addressLine2 && <p className="text-gray-600 mb-1">{address.addressLine2}</p>}
                        <p className="text-gray-600 mb-1">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-gray-600">📞 {address.phone}</p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full p-4 border-2 border-dashed border-cyan-300 rounded-xl text-cyan-600 hover:bg-cyan-50 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <FiPlus className="text-xl" />
                    Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-cyan-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white">
                  <FiCreditCard className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
                  <p className="text-gray-500 text-sm">Secure payment via Razorpay</p>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                <div className="flex items-center gap-3">
                  <FiLock className="text-2xl text-cyan-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Online Payment (Razorpay)</p>
                    <p className="text-sm text-gray-600">Pay securely with UPI, Cards, Net Banking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-cyan-100 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl text-white">
                  <FiShoppingBag className="text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {validItems.map((item) => (
                  <div key={item._id || item.product?._id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-2">{item.product?.name || 'Product'}</p>
                      <p className="text-gray-600 text-xs">Qty: {item.quantity || 1}</p>
                      <p className="text-cyan-600 font-bold">
                        ₹{((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    <FiTruck className="text-sm" />
                    Shipping
                  </span>
                  <span className="font-semibold">{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST)</span>
                  <span className="font-semibold">₹{tax.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                <FiShield className="text-2xl text-green-600" />
                <p className="text-sm text-green-800 font-semibold">Secure & Encrypted Payment</p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress || !razorpayReady || !RAZORPAY_KEY_ID}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiLock />
                    Place Order & Pay
                  </>
                )}
              </button>

              {!RAZORPAY_KEY_ID && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  ⚠️ Payment gateway not configured. Please add VITE_RAZORPAY_KEY_ID to your .env file.
                </p>
              )}
              {!razorpayReady && RAZORPAY_KEY_ID && (
                <p className="text-xs text-yellow-600 mt-2 text-center">Loading payment gateway...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
