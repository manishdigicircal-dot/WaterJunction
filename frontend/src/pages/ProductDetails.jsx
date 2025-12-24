import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getTranslation } from '../utils/translations';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiZoomIn,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
  FiTag,
  FiClock,
  FiShare2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import toast from 'react-hot-toast';

import { API_URL } from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useSelector((state) => state.language);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.category) {
      fetchSimilarProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data.product);
      // Set first image as selected, or video if no images
      if (data.product?.images?.length > 0) {
        setSelectedImage(0);
      } else if (data.product?.video) {
        setSelectedImage(-1);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      setSimilarLoading(true);
      const { data } = await axios.get(
        `${API_URL}/products?category=${product.category._id || product.category}&limit=10`
      );
      // Filter out current product
      const filtered = (data.products || []).filter(p => p._id !== product._id);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleAddToCart = async (options = {}) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      if (options.redirectOnFail) {
        navigate('/login?redirect=/checkout');
      }
      return false;
    }
    
    if (!product || !product._id) {
      toast.error('Product information is missing');
      return false;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return false;
    }
    
    if (quantity < 1 || quantity > product.stock) {
      toast.error(`Quantity must be between 1 and ${product.stock}`);
      return false;
    }
    
    setActionLoading(true);
    try {
      const result = await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      if (!options.silent) {
        toast.success('Added to cart!');
      }
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error || 'Failed to add to cart');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login?redirect=/checkout');
      return;
    }
    
    if (!product || !product._id) {
      toast.error('Product information is missing');
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    setActionLoading(true);
    try {
      // Add to cart first
      const result = await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      
      if (result) {
        // Wait a bit to ensure cart is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        // Navigate to checkout
        navigate('/checkout');
      } else {
        toast.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      toast.error(error || 'Failed to add product to cart. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await dispatch(addToWishlist(product._id)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error || 'Failed to add to wishlist');
    }
  };

  const getShareUrl = () => {
    return `${window.location.origin}/products/${product._id}`;
  };

  const getShareText = () => {
    return `Check out ${product.name} at Water Junction! ${product.description?.substring(0, 100)}...`;
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const image = product.images?.[0] || '';

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        const subject = encodeURIComponent(`Check out ${product.name}`);
        const body = encodeURIComponent(`${text}\n\nView product: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: product.name,
            text: text,
            url: url
          });
        }
    }
    setShowShareMenu(false);
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const isDiscounted = product?.mrp > product?.price;
  const savings = isDiscounted ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const images = product?.images?.length ? product.images : ['/placeholder.jpg'];
  const currentImage = selectedImage >= 0 && selectedImage < images.length ? images[selectedImage] : (images[0] || '/placeholder.jpg');
  const highlights =
    product?.highlights?.length
      ? product.highlights
      : [
          'Advanced purification for clean, safe water',
          'Energy-efficient performance with low maintenance',
          'Elegant design that fits modern kitchens'
        ];

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-sky-50 via-white to-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-2/3 bg-sky-100 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-sky-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 w-1/2 bg-sky-100 rounded" />
                <div className="h-10 w-1/3 bg-sky-100 rounded" />
                <div className="h-20 bg-sky-100 rounded" />
                <div className="h-12 bg-sky-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sky-50 via-white to-sky-100 flex items-center justify-center px-4">
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl px-8 py-10 text-center">
          <p className="text-lg font-semibold text-slate-800">Product not found</p>
          <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const renderSpecifications = () => {
    if (!product.specifications) return null;

    const specs = product.specifications;
    const sections = [
      { 
        title: 'Performance Features', 
        data: specs.performanceFeatures,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        headerBg: 'bg-blue-100',
        headerText: 'text-blue-800'
      },
      { 
        title: 'Warranty', 
        data: specs.warranty,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        headerBg: 'bg-green-100',
        headerText: 'text-green-800'
      },
      { 
        title: 'General', 
        data: specs.general,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        headerBg: 'bg-purple-100',
        headerText: 'text-purple-800'
      },
      { 
        title: 'Dimensions', 
        data: specs.dimensions,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        headerBg: 'bg-orange-100',
        headerText: 'text-orange-800'
      }
    ];

    // Filter out empty sections
    const validSections = sections.filter(section => section.data && Object.keys(section.data).length > 0);
    if (validSections.length === 0) return null;

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-md p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-slate-900 pb-2 border-b-2 border-slate-300">Specifications</h3>
        <div className="space-y-3">
          {validSections.map((section) => (
            <div 
              key={section.title} 
              className={`${section.bgColor} ${section.borderColor} border rounded-lg overflow-hidden shadow-sm`}
            >
              <div className={`${section.headerBg} ${section.headerText} px-3 py-2 border-b ${section.borderColor}`}>
                <h4 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {section.title}
                </h4>
              </div>
              <div className="p-3 space-y-2">
                {Object.entries(section.data).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`flex justify-between items-start gap-3 py-2 ${
                      idx < Object.entries(section.data).length - 1 ? `border-b ${section.borderColor} border-opacity-50` : ''
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-semibold ${section.textColor} flex-shrink-0 w-2/5`}>
                      {key}
                    </span>
                    <span className={`text-xs sm:text-sm ${section.textColor} text-right flex-1 font-medium`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-slate-500 mb-3 space-x-2">
          <Link to="/" className="hover:text-primary-600 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition">Products</Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left: Vertical Image Gallery (Flipkart Style) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto max-h-[600px] pb-2 lg:pb-0">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {/* Video Thumbnail in Gallery */}
              {product.video && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(-1); // Special index for video
                  }}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all relative group ${
                    selectedImage === -1
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {(() => {
                    let videoThumbnail = product.images?.[0] || '/placeholder.jpg';
                    if (product.video.startsWith('http')) {
                      if (product.video.includes('youtube.com') || product.video.includes('youtu.be')) {
                        let videoId = '';
                        if (product.video.includes('youtu.be/')) {
                          videoId = product.video.split('youtu.be/')[1]?.split('?')[0] || '';
                        } else if (product.video.includes('youtube.com')) {
                          videoId = product.video.split('v=')[1]?.split('&')[0] || '';
                        }
                        if (videoId) {
                          videoThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        }
                      }
                    }
                    return (
                      <img
                        src={videoThumbnail}
                        alt="Video"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = product.images?.[0] || '/placeholder.jpg';
                        }}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Center: Main Image/Video Display */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div
              className="relative overflow-hidden rounded-xl bg-white group cursor-zoom-in shadow-md border border-slate-200"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100">
                {selectedImage === -1 && product.video ? (
                  // Video Display
                  <div className="w-full h-full bg-black">
                    {product.video.startsWith('http') ? (
                      product.video.includes('youtube.com') || product.video.includes('youtu.be') ? (
                        <iframe
                          src={product.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allowFullScreen
                          title="Product Video"
                        />
                      ) : product.video.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${product.video.split('/').pop()}`}
                          className="w-full h-full"
                          allowFullScreen
                          title="Product Video"
                        />
                      ) : (
                        <video src={product.video} controls className="w-full h-full" />
                      )
                    ) : (
                      <video src={product.video} controls className="w-full h-full" />
                    )}
                  </div>
                ) : (
                  // Image Display with Zoom
                  <>
                    <img
                      src={currentImage}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isZooming ? 'scale-150' : 'scale-100'
                      }`}
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                    {isZooming && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs backdrop-blur-sm">
                        <FiZoomIn size={14} />
                        <span>Hover to zoom</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  {product.stock > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold shadow-lg">
                      <FiCheckCircle className="mr-1" size={12} /> In Stock
                    </span>
                  )}
                  {isDiscounted && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-lg">
                      <FiTag className="mr-1" size={12} /> {savings}% OFF
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    onClick={handleAddToWishlist}
                    className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-primary-600 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition shadow-lg"
                    aria-label="Add to wishlist"
                  >
                    <FiHeart size={16} />
                  </button>
                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-primary-600 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition shadow-lg"
                      aria-label="Share product"
                    >
                      <FiShare2 size={16} />
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 min-w-[200px] z-50">
                        <div className="text-xs font-semibold text-slate-500 px-3 py-2 border-b">Share via</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 transition text-left"
                          >
                            <FaWhatsapp className="text-green-500 text-xl" />
                            <span className="text-sm text-slate-700">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition text-left"
                          >
                            <FaFacebook className="text-blue-600 text-xl" />
                            <span className="text-sm text-slate-700">Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 transition text-left"
                          >
                            <FaTwitter className="text-sky-500 text-xl" />
                            <span className="text-sm text-slate-700">Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition text-left"
                          >
                            <FaLinkedin className="text-blue-700 text-xl" />
                            <span className="text-sm text-slate-700">LinkedIn</span>
                          </button>
                          <button
                            onClick={() => handleShare('email')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition text-left"
                          >
                            <MdEmail className="text-slate-600 text-xl" />
                            <span className="text-sm text-slate-700">Email</span>
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition text-left"
                          >
                            <FiShare2 className="text-slate-600 text-xl" />
                            <span className="text-sm text-slate-700">Copy Link</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section - Below Image Frame */}
            {product.specifications && (
              <div className="mt-4 sm:mt-5">
                {renderSpecifications()}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-6 order-3">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 py-5 md:px-6 md:py-6 space-y-4 sticky top-4">
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wider text-primary-600 font-bold">
                  {product.category?.name || 'Product'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiPackage size={14} />
                  <span>SKU: {product.sku || product._id?.slice(-6) || 'N/A'}</span>
                </div>
              </div>

              {/* Rating */}
              {product.ratings && product.ratings.average > 0 && (
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={`${
                          i < Math.round(product.ratings.average)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    {product.ratings.average} ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline flex-wrap gap-3 pb-3 border-b border-gray-200">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {isDiscounted && (
                  <>
                    <span className="text-xl text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-600 text-sm font-bold">
                      {savings}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-200">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-50 text-center">
                  <FiTruck className="text-blue-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Fast Delivery</p>
                  <p className="text-[10px] text-gray-500">2-5 days</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 text-center">
                  <FiRefreshCw className="text-green-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Easy Returns</p>
                  <p className="text-[10px] text-gray-500">7-day</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-purple-50 text-center">
                  <FiShield className="text-purple-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Warranty</p>
                  <p className="text-[10px] text-gray-500">{product.specifications?.warranty?.summary || '1 year'}</p>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center flex-wrap gap-2 pb-3 border-b border-gray-200">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                    <FiCheckCircle className="mr-1.5" size={14} />
                    {getTranslation('inStock', language)} ({product.stock} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold">
                    {getTranslation('outOfStock', language)}
                  </span>
                )}
                <div className="flex items-center text-xs text-gray-600">
                  <FiClock className="mr-1.5" size={14} />
                  Ships within 24 hrs
                </div>
              </div>

              {/* Description & Highlights */}
              <div className="space-y-3 pb-3 border-b border-gray-200">
                {product.description && (
                  <div className="text-sm text-gray-700 leading-relaxed">{product.description}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-700"
                    >
                      <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                      <span className="line-clamp-2">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition border border-gray-300 flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold min-w-[2rem] text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition border border-gray-300 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={product.stock === 0 || actionLoading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-wide"
                >
                  <FiShoppingCart size={18} />
                  <span>{actionLoading ? 'Please wait...' : getTranslation('addToCart', language)}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || actionLoading}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-wide"
                >
                  {actionLoading ? 'Adding...' : getTranslation('buyNow', language)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        {product.questions && product.questions.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-lg p-5 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Questions & Answers</h3>
            <div className="space-y-3">
              {product.questions
                .filter((q) => q.isApproved && q.answer)
                .map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-xl text-slate-800 shadow-sm"
                  >
                    <p className="font-semibold mb-1.5 text-sm sm:text-base">Q: {q.question}</p>
                    <p className="text-slate-700 text-xs sm:text-sm">A: {q.answer}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Similar Products</h3>
                <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-1.5 sm:mt-2"></div>
              </div>
              {similarProducts.length > 4 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-full bg-white border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 hover:text-primary-600"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const maxSlides = Math.ceil(similarProducts.length / 4) - 1;
                      setCurrentSlide(Math.min(maxSlides, currentSlide + 1));
                    }}
                    disabled={currentSlide >= Math.ceil(similarProducts.length / 4) - 1}
                    className="p-2 rounded-full bg-white border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 hover:text-primary-600"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / Math.min(4, similarProducts.length))}%)` 
                }}
              >
                {similarProducts.map((similarProduct) => (
                  <div
                    key={similarProduct._id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / Math.min(4, similarProducts.length)}%` }}
                  >
                    <Link
                      to={`/products/${similarProduct._id}`}
                      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group h-full"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                        <img
                          src={similarProduct.images?.[0] || '/placeholder.jpg'}
                          alt={similarProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3"></div>
                        <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm min-h-[2.5rem]">
                          {similarProduct.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary-600">
                              ₹{similarProduct.price.toLocaleString()}
                            </p>
                            {similarProduct.mrp > similarProduct.price && (
                              <p className="text-xs text-slate-400 line-through">
                                ₹{similarProduct.mrp.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Indicators */}
            {similarProducts.length > 4 && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(Math.ceil(similarProducts.length / 4))].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx
                        ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getTranslation } from '../utils/translations';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiZoomIn,
  FiPackage,
  FiTruck,
  FiRefreshCw,
  FiCheckCircle,
  FiShield,
  FiTag,
  FiClock,
  FiShare2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import toast from 'react-hot-toast';

import { API_URL } from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useSelector((state) => state.language);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.category) {
      fetchSimilarProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/products/${id}`);
      setProduct(data.product);
      // Set first image as selected, or video if no images
      if (data.product?.images?.length > 0) {
        setSelectedImage(0);
      } else if (data.product?.video) {
        setSelectedImage(-1);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      setSimilarLoading(true);
      const { data } = await axios.get(
        `${API_URL}/products?category=${product.category._id || product.category}&limit=10`
      );
      // Filter out current product
      const filtered = (data.products || []).filter(p => p._id !== product._id);
      setSimilarProducts(filtered);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleAddToCart = async (options = {}) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      if (options.redirectOnFail) {
        navigate('/login?redirect=/checkout');
      }
      return false;
    }
    
    if (!product || !product._id) {
      toast.error('Product information is missing');
      return false;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return false;
    }
    
    if (quantity < 1 || quantity > product.stock) {
      toast.error(`Quantity must be between 1 and ${product.stock}`);
      return false;
    }
    
    setActionLoading(true);
    try {
      const result = await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      if (!options.silent) {
        toast.success('Added to cart!');
      }
      return true;
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error || 'Failed to add to cart');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login?redirect=/checkout');
      return;
    }
    
    if (!product || !product._id) {
      toast.error('Product information is missing');
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    setActionLoading(true);
    try {
      // Add to cart first
      const result = await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      
      if (result) {
        // Wait a bit to ensure cart is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        // Navigate to checkout
        navigate('/checkout');
      } else {
        toast.error('Failed to add product to cart');
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      toast.error(error || 'Failed to add product to cart. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await dispatch(addToWishlist(product._id)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error || 'Failed to add to wishlist');
    }
  };

  const getShareUrl = () => {
    return `${window.location.origin}/products/${product._id}`;
  };

  const getShareText = () => {
    return `Check out ${product.name} at Water Junction! ${product.description?.substring(0, 100)}...`;
  };

  const handleShare = (platform) => {
    const url = getShareUrl();
    const text = getShareText();
    const image = product.images?.[0] || '';

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        const subject = encodeURIComponent(`Check out ${product.name}`);
        const body = encodeURIComponent(`${text}\n\nView product: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: product.name,
            text: text,
            url: url
          });
        }
    }
    setShowShareMenu(false);
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const isDiscounted = product?.mrp > product?.price;
  const savings = isDiscounted ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const images = product?.images?.length ? product.images : ['/placeholder.jpg'];
  const currentImage = selectedImage >= 0 && selectedImage < images.length ? images[selectedImage] : (images[0] || '/placeholder.jpg');
  const highlights =
    product?.highlights?.length
      ? product.highlights
      : [
          'Advanced purification for clean, safe water',
          'Energy-efficient performance with low maintenance',
          'Elegant design that fits modern kitchens'
        ];

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-sky-50 via-white to-sky-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-2/3 bg-sky-100 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-sky-100 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-6 w-1/2 bg-sky-100 rounded" />
                <div className="h-10 w-1/3 bg-sky-100 rounded" />
                <div className="h-20 bg-sky-100 rounded" />
                <div className="h-12 bg-sky-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sky-50 via-white to-sky-100 flex items-center justify-center px-4">
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl px-8 py-10 text-center">
          <p className="text-lg font-semibold text-slate-800">Product not found</p>
          <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const renderSpecifications = () => {
    if (!product.specifications) return null;

    const specs = product.specifications;
    const sections = [
      { 
        title: 'Performance Features', 
        data: specs.performanceFeatures,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        headerBg: 'bg-blue-100',
        headerText: 'text-blue-800'
      },
      { 
        title: 'Warranty', 
        data: specs.warranty,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        headerBg: 'bg-green-100',
        headerText: 'text-green-800'
      },
      { 
        title: 'General', 
        data: specs.general,
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        headerBg: 'bg-purple-100',
        headerText: 'text-purple-800'
      },
      { 
        title: 'Dimensions', 
        data: specs.dimensions,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        headerBg: 'bg-orange-100',
        headerText: 'text-orange-800'
      }
    ];

    // Filter out empty sections
    const validSections = sections.filter(section => section.data && Object.keys(section.data).length > 0);
    if (validSections.length === 0) return null;

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-md p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-slate-900 pb-2 border-b-2 border-slate-300">Specifications</h3>
        <div className="space-y-3">
          {validSections.map((section) => (
            <div 
              key={section.title} 
              className={`${section.bgColor} ${section.borderColor} border rounded-lg overflow-hidden shadow-sm`}
            >
              <div className={`${section.headerBg} ${section.headerText} px-3 py-2 border-b ${section.borderColor}`}>
                <h4 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {section.title}
                </h4>
              </div>
              <div className="p-3 space-y-2">
                {Object.entries(section.data).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`flex justify-between items-start gap-3 py-2 ${
                      idx < Object.entries(section.data).length - 1 ? `border-b ${section.borderColor} border-opacity-50` : ''
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-semibold ${section.textColor} flex-shrink-0 w-2/5`}>
                      {key}
                    </span>
                    <span className={`text-xs sm:text-sm ${section.textColor} text-right flex-1 font-medium`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-slate-500 mb-3 space-x-2">
          <Link to="/" className="hover:text-primary-600 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition">Products</Link>
          <span>/</span>
          <span className="text-slate-700 font-semibold line-clamp-1">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left: Vertical Image Gallery (Flipkart Style) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto max-h-[600px] pb-2 lg:pb-0">
              {images.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {/* Video Thumbnail in Gallery */}
              {product.video && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(-1); // Special index for video
                  }}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all relative group ${
                    selectedImage === -1
                      ? 'border-primary-500 ring-2 ring-primary-200 scale-105'
                      : 'border-slate-200 hover:border-primary-300'
                  }`}
                >
                  {(() => {
                    let videoThumbnail = product.images?.[0] || '/placeholder.jpg';
                    if (product.video.startsWith('http')) {
                      if (product.video.includes('youtube.com') || product.video.includes('youtu.be')) {
                        let videoId = '';
                        if (product.video.includes('youtu.be/')) {
                          videoId = product.video.split('youtu.be/')[1]?.split('?')[0] || '';
                        } else if (product.video.includes('youtube.com')) {
                          videoId = product.video.split('v=')[1]?.split('&')[0] || '';
                        }
                        if (videoId) {
                          videoThumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        }
                      }
                    }
                    return (
                      <img
                        src={videoThumbnail}
                        alt="Video"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = product.images?.[0] || '/placeholder.jpg';
                        }}
                      />
                    );
                  })()}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 lg:w-5 lg:h-5 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Center: Main Image/Video Display */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div
              className="relative overflow-hidden rounded-xl bg-white group cursor-zoom-in shadow-md border border-slate-200"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100">
                {selectedImage === -1 && product.video ? (
                  // Video Display
                  <div className="w-full h-full bg-black">
                    {product.video.startsWith('http') ? (
                      product.video.includes('youtube.com') || product.video.includes('youtu.be') ? (
                        <iframe
                          src={product.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allowFullScreen
                          title="Product Video"
                        />
                      ) : product.video.includes('vimeo.com') ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${product.video.split('/').pop()}`}
                          className="w-full h-full"
                          allowFullScreen
                          title="Product Video"
                        />
                      ) : (
                        <video src={product.video} controls className="w-full h-full" />
                      )
                    ) : (
                      <video src={product.video} controls className="w-full h-full" />
                    )}
                  </div>
                ) : (
                  // Image Display with Zoom
                  <>
                    <img
                      src={currentImage}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        isZooming ? 'scale-150' : 'scale-100'
                      }`}
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }}
                    />
                    {isZooming && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full flex items-center space-x-2 text-xs backdrop-blur-sm">
                        <FiZoomIn size={14} />
                        <span>Hover to zoom</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  {product.stock > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold shadow-lg">
                      <FiCheckCircle className="mr-1" size={12} /> In Stock
                    </span>
                  )}
                  {isDiscounted && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-lg">
                      <FiTag className="mr-1" size={12} /> {savings}% OFF
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    onClick={handleAddToWishlist}
                    className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-primary-600 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition shadow-lg"
                    aria-label="Add to wishlist"
                  >
                    <FiHeart size={16} />
                  </button>
                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 text-primary-600 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition shadow-lg"
                      aria-label="Share product"
                    >
                      <FiShare2 size={16} />
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 min-w-[200px] z-50">
                        <div className="text-xs font-semibold text-slate-500 px-3 py-2 border-b">Share via</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 transition text-left"
                          >
                            <FaWhatsapp className="text-green-500 text-xl" />
                            <span className="text-sm text-slate-700">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition text-left"
                          >
                            <FaFacebook className="text-blue-600 text-xl" />
                            <span className="text-sm text-slate-700">Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 transition text-left"
                          >
                            <FaTwitter className="text-sky-500 text-xl" />
                            <span className="text-sm text-slate-700">Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition text-left"
                          >
                            <FaLinkedin className="text-blue-700 text-xl" />
                            <span className="text-sm text-slate-700">LinkedIn</span>
                          </button>
                          <button
                            onClick={() => handleShare('email')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition text-left"
                          >
                            <MdEmail className="text-slate-600 text-xl" />
                            <span className="text-sm text-slate-700">Email</span>
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition text-left"
                          >
                            <FiShare2 className="text-slate-600 text-xl" />
                            <span className="text-sm text-slate-700">Copy Link</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Section - Below Image Frame */}
            {product.specifications && (
              <div className="mt-4 sm:mt-5">
                {renderSpecifications()}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-6 order-3">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-5 py-5 md:px-6 md:py-6 space-y-4 sticky top-4">
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <p className="text-xs uppercase tracking-wider text-primary-600 font-bold">
                  {product.category?.name || 'Product'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiPackage size={14} />
                  <span>SKU: {product.sku || product._id?.slice(-6) || 'N/A'}</span>
                </div>
              </div>

              {/* Rating */}
              {product.ratings && product.ratings.average > 0 && (
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={16}
                        className={`${
                          i < Math.round(product.ratings.average)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    {product.ratings.average} ({product.ratings.count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline flex-wrap gap-3 pb-3 border-b border-gray-200">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {isDiscounted && (
                  <>
                    <span className="text-xl text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-red-100 text-red-600 text-sm font-bold">
                      {savings}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-200">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-50 text-center">
                  <FiTruck className="text-blue-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Fast Delivery</p>
                  <p className="text-[10px] text-gray-500">2-5 days</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-50 text-center">
                  <FiRefreshCw className="text-green-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Easy Returns</p>
                  <p className="text-[10px] text-gray-500">7-day</p>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-purple-50 text-center">
                  <FiShield className="text-purple-600 text-lg" />
                  <p className="text-xs font-semibold text-gray-800">Warranty</p>
                  <p className="text-[10px] text-gray-500">{product.specifications?.warranty?.summary || '1 year'}</p>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center flex-wrap gap-2 pb-3 border-b border-gray-200">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                    <FiCheckCircle className="mr-1.5" size={14} />
                    {getTranslation('inStock', language)} ({product.stock} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold">
                    {getTranslation('outOfStock', language)}
                  </span>
                )}
                <div className="flex items-center text-xs text-gray-600">
                  <FiClock className="mr-1.5" size={14} />
                  Ships within 24 hrs
                </div>
              </div>

              {/* Description & Highlights */}
              <div className="space-y-3 pb-3 border-b border-gray-200">
                {product.description && (
                  <div className="text-sm text-gray-700 leading-relaxed">{product.description}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 text-xs text-gray-700"
                    >
                      <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={14} />
                      <span className="line-clamp-2">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition border border-gray-300 flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold min-w-[2rem] text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition border border-gray-300 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleAddToCart()}
                  disabled={product.stock === 0 || actionLoading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-wide"
                >
                  <FiShoppingCart size={18} />
                  <span>{actionLoading ? 'Please wait...' : getTranslation('addToCart', language)}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || actionLoading}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-bold uppercase tracking-wide"
                >
                  {actionLoading ? 'Adding...' : getTranslation('buyNow', language)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        {product.questions && product.questions.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-lg p-5 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">Questions & Answers</h3>
            <div className="space-y-3">
              {product.questions
                .filter((q) => q.isApproved && q.answer)
                .map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-xl text-slate-800 shadow-sm"
                  >
                    <p className="font-semibold mb-1.5 text-sm sm:text-base">Q: {q.question}</p>
                    <p className="text-slate-700 text-xs sm:text-sm">A: {q.answer}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Similar Products</h3>
                <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-1.5 sm:mt-2"></div>
              </div>
              {similarProducts.length > 4 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-2 rounded-full bg-white border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 hover:text-primary-600"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const maxSlides = Math.ceil(similarProducts.length / 4) - 1;
                      setCurrentSlide(Math.min(maxSlides, currentSlide + 1));
                    }}
                    disabled={currentSlide >= Math.ceil(similarProducts.length / 4) - 1}
                    className="p-2 rounded-full bg-white border-2 border-slate-200 hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 hover:text-primary-600"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / Math.min(4, similarProducts.length))}%)` 
                }}
              >
                {similarProducts.map((similarProduct) => (
                  <div
                    key={similarProduct._id}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / Math.min(4, similarProducts.length)}%` }}
                  >
                    <Link
                      to={`/products/${similarProduct._id}`}
                      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group h-full"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                        <img
                          src={similarProduct.images?.[0] || '/placeholder.jpg'}
                          alt={similarProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3"></div>
                        <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm min-h-[2.5rem]">
                          {similarProduct.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary-600">
                              ₹{similarProduct.price.toLocaleString()}
                            </p>
                            {similarProduct.mrp > similarProduct.price && (
                              <p className="text-xs text-slate-400 line-through">
                                ₹{similarProduct.mrp.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Indicators */}
            {similarProducts.length > 4 && (
              <div className="flex justify-center gap-2 mt-6">
                {[...Array(Math.ceil(similarProducts.length / 4))].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentSlide === idx
                        ? 'w-8 bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
