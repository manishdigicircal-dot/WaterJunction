import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../../store/slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getTranslation } from '../../utils/translations';
import { FiEdit2, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiHeart, FiShoppingCart, FiCheck, FiX, FiCamera, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { user } = useSelector((state) => state.auth);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageKey, setImageKey] = useState(0);

  const hasFetchedUser = useRef(false);
  const lastToken = useRef(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Only fetch if:
    // 1. We have a token
    // 2. User is not loaded
    // 3. We haven't fetched yet OR token has changed
    // 4. Not rate limited
    if (token && !user && (!hasFetchedUser.current || lastToken.current !== token)) {
      hasFetchedUser.current = true;
      lastToken.current = token;
      
      dispatch(getMe())
        .unwrap()
        .then(() => {
          // User loaded successfully
          hasFetchedUser.current = true;
        })
        .catch((error) => {
          // Don't log out on error, just show a message
          console.error('Failed to fetch user data:', error);
          // For rate limit, keep the flag set to prevent immediate retries
          if (error === 'RATE_LIMITED') {
            // Reset after 10 seconds to allow retry
            setTimeout(() => {
              hasFetchedUser.current = false;
            }, 10000);
          } else {
            // For other errors, reset flag after a delay to allow retry
            setTimeout(() => {
              hasFetchedUser.current = false;
            }, 5000);
          }
        });
    }
    
    // Reset flag when user is successfully loaded
    if (user) {
      hasFetchedUser.current = true;
    }
  }, [dispatch]); // Remove user from dependencies to prevent infinite loops

  // Bump cache-bust key when profile photo changes
  useEffect(() => {
    if (user?.profilePhoto) {
      setImageKey((prev) => prev + 1);
    }
  }, [user?.profilePhoto]);

  // Helper: cache-busted src only for non-base64 images
  const getProfilePhotoSrc = () => {
    const raw = user?.profilePhoto;
    if (!raw) return null;
    const photo = raw.trim();
    if (!photo) return null;
    if (photo.startsWith('data:image')) {
      // strip any query fragments if present in base64 data URLs
      return photo.split('?')[0];
    }
    return `${photo}${photo.includes('?') ? '&' : '?'}v=${imageKey || Date.now()}`;
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await axios.put(
          `${API_URL}/users/address/${editingAddress._id}`,
          addressForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Address updated');
      } else {
        await axios.post(
          `${API_URL}/users/address`,
          addressForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Address added');
      }
      // Refresh user data, but don't log out on error
      dispatch(getMe()).catch((error) => {
        console.error('Failed to refresh user data:', error);
        // Don't show error toast as the address was saved successfully
      });
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        await axios.delete(`${API_URL}/users/address/${addressId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Address deleted');
        dispatch(getMe()).catch((error) => {
          console.error('Failed to refresh user data:', error);
        });
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    const fileInput = document.getElementById('profileImageInput');
    const file = fileInput?.files[0];
    
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Profile image updated successfully!');
      setImagePreview(null);
      setImageKey(Date.now());

      // Fetch fresh user data to ensure state is updated, bump key after
      try {
        const result = await dispatch(getMe()).unwrap();
        if (result?.user?.profilePhoto) {
          setImageKey(Date.now());
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // Don't show error as image was uploaded successfully
      }
      
      // Reset file input
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelImageUpload = () => {
    setImagePreview(null);
    const fileInput = document.getElementById('profileImageInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Water Wave Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-profile)" opacity="0.4"></path>
          <defs>
            <linearGradient id="wave-gradient-profile" x1="0%" y1="0%" x2="100%" y2="0%">
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
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-cyan-100 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600">
                {/* Show preview if available */}
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover absolute inset-0 z-20"
                  />
                )}
                
                {/* Show uploaded image if available and no preview */}
                {!imagePreview && user?.profilePhoto && user.profilePhoto.trim() !== '' && (
                  <img 
                    key={`profile-img-${imageKey}-${user.profilePhoto}`}
                    src={getProfilePhotoSrc()}
                    alt={user?.name || 'Profile'} 
                    className="w-full h-full object-cover absolute inset-0 z-10"
                    onError={(e) => {
                      console.error('❌ Image load error:', user.profilePhoto);
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.profile-fallback');
                      if (fallback) {
                        fallback.style.display = 'flex';
                        fallback.style.zIndex = '15';
                      }
                    }}
                    onLoad={(e) => {
                      console.log('✅ Image loaded successfully:', user.profilePhoto);
                      e.target.style.display = 'block';
                      e.target.style.zIndex = '10';
                      const fallback = e.target.parentElement.querySelector('.profile-fallback');
                      if (fallback) {
                        fallback.style.display = 'none';
                      }
                    }}
                    style={{ display: 'block' }}
                  />
                )}
                
                {/* Fallback - show initial letter */}
                <div 
                  className="profile-fallback w-full h-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center text-4xl md:text-5xl text-white font-bold absolute inset-0 z-5"
                  style={{ 
                    display: (imagePreview || (user?.profilePhoto && user.profilePhoto.trim() !== '')) ? 'none' : 'flex' 
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              
              {/* Edit Button Overlay */}
              <label 
                htmlFor="profileImageInput"
                className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border-4 border-white group-hover:opacity-100"
                title="Change profile picture"
              >
                <FiCamera className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </label>
              
              {/* Hidden File Input */}
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            {/* Image Upload Preview & Actions */}
            {imagePreview && (
              <div className="mt-4 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-300">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview your new profile picture</p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploadingImage ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" />
                        <span>Save Image</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelImageUpload}
                    disabled={uploadingImage}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FiX className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 mb-4">{user?.email || 'N/A'}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <Link to="/orders" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200">
                  <FiPackage className="text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Orders</span>
                </Link>
                <Link to="/cart" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg hover:from-cyan-100 hover:to-blue-100 transition-all border border-cyan-200">
                  <FiShoppingCart className="text-cyan-600" />
                  <span className="text-sm font-semibold text-gray-700">Cart ({cartItemCount})</span>
                </Link>
                <Link to="/wishlist" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg hover:from-pink-100 hover:to-red-100 transition-all border border-pink-200">
                  <FiHeart className="text-pink-600" />
                  <span className="text-sm font-semibold text-gray-700">Wishlist ({wishlistCount})</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiUser className="text-cyan-600 mr-3" />
                Personal Information
              </h2>
              <div className="space-y-5">
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 rounded-xl border border-cyan-100">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                    <FiUser className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                    <p className="font-semibold text-gray-900 text-lg">{user?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                    <FiMail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                    <p className="font-semibold text-gray-900 text-lg">{user?.email || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-xl border border-teal-100">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                    <FiPhone className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <p className="font-semibold text-gray-900 text-lg">{user?.phone || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-1">Phone cannot be changed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0 flex items-center">
                  <FiMapPin className="text-cyan-600 mr-3" />
                  Saved Addresses
                </h2>
                <button
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddress(null);
                    setAddressForm({
                      name: '',
                      phone: '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      pincode: '',
                      isDefault: false
                    });
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  {showAddressForm ? (
                    <>
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <FiMapPin className="w-4 h-4" />
                      <span>Add New Address</span>
                    </>
                  )}
                </button>
              </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="mb-6 p-6 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 rounded-xl border border-cyan-200 space-y-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter recipient name"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Street, Area, Landmark (optional)"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all duration-300 bg-white"
                    />
                  </div>
                </div>
                
                <label className="flex items-center space-x-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-5 h-5 text-cyan-600 focus:ring-cyan-500 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                </label>
                
                <div className="flex space-x-3">
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      setAddressForm({
                        name: '',
                        phone: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false
                      });
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.addresses.map((address) => (
                  <div 
                    key={address._id} 
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                      address.isDefault 
                        ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300 shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-cyan-300 hover:shadow-lg'
                    }`}
                  >
                    {address.isDefault && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                          <FiCheck className="w-3 h-3" />
                          <span>Default</span>
                        </span>
                      </div>
                    )}
                    
                    <div className="pr-16">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          address.isDefault 
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <FiMapPin className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{address.name}</h3>
                          <p className="text-sm text-gray-500">{address.phone}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-700">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-semibold text-sm flex items-center space-x-2"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm flex items-center space-x-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold mb-2">No addresses saved yet</p>
                <p className="text-sm text-gray-500">Add your first address to get started</p>
              </div>
            )}
          </div>
          </div>

          {/* Sidebar - Quick Links */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/orders" 
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiPackage className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">My Orders</p>
                    <p className="text-xs text-gray-500">View order history</p>
                  </div>
                </Link>
                
                <Link 
                  to="/cart" 
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl hover:from-cyan-100 hover:to-blue-100 transition-all border border-cyan-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Shopping Cart</p>
                    <p className="text-xs text-gray-500">{cartItemCount} items</p>
                  </div>
                </Link>
                
                <Link 
                  to="/wishlist" 
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-red-50 rounded-xl hover:from-pink-100 hover:to-red-100 transition-all border border-pink-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiHeart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Wishlist</p>
                    <p className="text-xs text-gray-500">{wishlistCount} items</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-xl border border-cyan-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className="text-sm font-semibold text-cyan-600">Standard</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


