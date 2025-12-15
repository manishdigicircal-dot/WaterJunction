import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getTranslation } from '../utils/translations';
import { FiShoppingCart, FiHeart, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import Carousel from '../components/Carousel';
import FeaturesBar from '../components/FeaturesBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const { language } = useSelector((state) => state.language);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/products?limit=8`),
          axios.get(`${API_URL}/categories`)
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Detect screen size for responsive testimonials
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Testimonials data - 6 testimonials (3 per slide on desktop)
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Delhi, India',
      initials: 'RK',
      text: "Water Junction has completely transformed our water quality! The products are premium and delivery is super fast. Highly recommend to everyone looking for pure, healthy water solutions.",
      gradient: 'from-cyan-400 to-blue-500',
      ring: 'ring-cyan-200'
    },
    {
      name: 'Priya Mehta',
      location: 'Mumbai, India',
      initials: 'PM',
      text: "Best water products I've ever used! The quality is exceptional and the customer service is outstanding. My family loves the taste and purity. Thank you Water Junction!",
      gradient: 'from-blue-400 to-cyan-500',
      ring: 'ring-blue-200'
    },
    {
      name: 'Amit Sharma',
      location: 'Bangalore, India',
      initials: 'AS',
      text: "Amazing experience! The water filters are top-notch and the prices are very reasonable. Fast delivery and excellent packaging. Will definitely order again!",
      gradient: 'from-teal-400 to-cyan-500',
      ring: 'ring-teal-200'
    },
    {
      name: 'Neha Singh',
      location: 'Pune, India',
      initials: 'NS',
      text: "Outstanding quality and service! The water purifiers are easy to install and maintain. Great value for money. My whole family is happy with the purchase.",
      gradient: 'from-indigo-400 to-blue-500',
      ring: 'ring-indigo-200'
    },
    {
      name: 'Vikram Singh',
      location: 'Gurgaon, India',
      initials: 'VS',
      text: "Premium quality products at affordable prices! The customer support team is very helpful. Highly satisfied with my purchase. Water Junction is the best!",
      gradient: 'from-cyan-400 to-teal-500',
      ring: 'ring-cyan-200'
    },
    {
      name: 'Deepak Kumar',
      location: 'Chennai, India',
      initials: 'DK',
      text: "Excellent products and amazing service! The water quality has improved significantly. Fast shipping and great packaging. Very happy with Water Junction!",
      gradient: 'from-blue-400 to-indigo-500',
      ring: 'ring-blue-200'
    }
  ];

  // Calculate testimonials per slide - Desktop: 3 per slide, Tablet: 2, Mobile: 1
  const [testimonialsPerSlide, setTestimonialsPerSlide] = useState(3);
  
  useEffect(() => {
    const updateTestimonialsPerSlide = () => {
      if (window.innerWidth < 768) {
        setTestimonialsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setTestimonialsPerSlide(2);
      } else {
        setTestimonialsPerSlide(3); // Desktop: Always 3 per slide
      }
    };
    updateTestimonialsPerSlide();
    window.addEventListener('resize', updateTestimonialsPerSlide);
    return () => window.removeEventListener('resize', updateTestimonialsPerSlide);
  }, []);
  
  const totalSlides = Math.ceil(testimonials.length / testimonialsPerSlide);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => 
        prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await dispatch(addToWishlist(productId)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error || 'Failed to add to wishlist');
    }
  };

  return (
    <div>
      {/* Carousel Hero Section */}
      <section className="m-0 p-0 bg-transparent">
        <Carousel />
      </section>

      {/* Features Bar - Right Below Carousel */}
      <FeaturesBar />






















      {/* Featured Products */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white via-blue-50/20 via-cyan-50/30 to-white relative overflow-hidden">
        {/* Water Wave Background Effects */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="absolute top-10 right-10 w-96 h-96 text-primary-400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M45.7,-47.4C58.3,-36.3,67.2,-21.3,68.9,-5.6C70.6,10.1,65.1,26.5,55.3,39.8C45.5,53.1,31.4,63.3,15.7,67.2C0,71.1,-17.3,68.7,-32.1,61.5C-46.9,54.3,-59.2,42.3,-66.2,27.8C-73.2,13.3,-75,0.3,-72.1,-11.6C-69.2,-23.5,-61.6,-34.2,-51.5,-44.1C-41.4,-54,-28.8,-63.1,-15.5,-67.2C-2.2,-71.3,11.8,-70.4,45.7,-47.4Z" transform="translate(100 100)" />
            </svg>
            <svg className="absolute bottom-20 left-10 w-80 h-80 text-cyan-400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M37.4,-42.9C47.8,-34.2,55.6,-22.7,59.3,-9.8C63,3.1,62.6,17.5,57.2,29.5C51.8,41.5,41.4,51.1,29.4,56.5C17.4,61.9,3.8,63.1,-9.4,61.5C-22.6,59.9,-35.4,55.5,-45.8,47.8C-56.2,40.1,-64.2,29.1,-68.4,16.4C-72.6,3.7,-73,0.7,-70.4,-10.1C-67.8,-20.9,-62.2,-31.5,-53.9,-39.8C-45.6,-48.1,-34.6,-54.1,-22.8,-57.9C-11,-61.7,1.6,-63.3,14.5,-61.4C27.4,-59.5,40.6,-54.1,37.4,-42.9Z" transform="translate(100 100)" />
            </svg>
          </div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl opacity-20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header - Compact */}
          <div className="text-center mb-4 md:mb-5">
            <div className="inline-flex items-center justify-center mb-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mr-2 md:mr-3">
                <span className="text-xl md:text-2xl">⭐</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-cyan-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
                Featured Products
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-1">
              Handpicked premium water solutions just for you
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-primary-500"></div>
              <div className="h-1 w-2 bg-primary-500 rounded-full"></div>
              <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-primary-500"></div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {featuredProducts.map((product, index) => (
                  <div 
                    key={product._id} 
                    className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100 hover:border-primary-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Water Ripple Effect Border */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/20 via-cyan-400/20 to-primary-400/20 blur-xl"></div>
                    </div>

                    {/* Featured Badge */}
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-500 text-white text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 rounded-full shadow-xl flex items-center space-x-1 backdrop-blur-sm border border-white/30">
                      <FiStar className="w-3 h-3" />
                      <span>Featured</span>
                    </div>

                    {/* Wishlist Button - Top Right */}
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 border border-gray-100"
                      title="Add to Wishlist"
                    >
                      <FiHeart className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* Product Image */}
                    <Link to={`/products/${product._id}`} className="block relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-primary-50">
                      <div className="relative w-full h-52 md:h-60 overflow-hidden">
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (!e.target.nextSibling) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200';
                              placeholder.innerHTML = '💧';
                              e.target.parentElement.appendChild(placeholder);
                            }
                          }}
                        />
                        {/* Water Wave Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Discount Badge */}
                        {product.mrp > product.price && (
                          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full shadow-xl border border-white/30">
                            {product.discountPercent}% OFF
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4 md:p-5 relative bg-white">
                      {/* Water Drop Decorative Line */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Category Name */}
                      {product.category && (
                        <p className="text-[10px] md:text-xs text-cyan-600 uppercase tracking-wider mb-1.5 font-semibold">
                          {product.category.name || 'Product'}
                        </p>
                      )}

                      {/* Product Name */}
                      <Link to={`/products/${product._id}`}>
                        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-primary-600 transition-colors duration-300 mb-2.5 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] leading-tight">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      {product.ratings && product.ratings.average > 0 && (
                        <div className="flex items-center space-x-1.5 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${i < Math.round(product.ratings.average) ? 'fill-current' : ''}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs md:text-sm text-gray-600">
                            ({product.ratings.count || 0})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-3.5">
                        <div className="flex items-baseline space-x-2 flex-wrap">
                          <span className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-cyan-600 bg-clip-text text-transparent">
                            ₹{product.price?.toLocaleString() || '0'}
                          </span>
                          {product.mrp > product.price && (
                            <>
                              <span className="text-sm md:text-base text-gray-500 line-through">
                                ₹{product.mrp?.toLocaleString() || '0'}
                              </span>
                              <span className="text-xs md:text-sm text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                                Save ₹{(product.mrp - product.price).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="flex-1 bg-gradient-to-r from-primary-600 via-cyan-600 to-primary-600 text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl hover:from-primary-700 hover:via-cyan-700 hover:to-primary-700 transition-all duration-300 flex items-center justify-center space-x-1.5 md:space-x-2 font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <FiShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">{getTranslation('addToCart', language)}</span>
                          <span className="sm:hidden">Add</span>
                        </button>
                        <Link
                          to={`/products/${product._id}`}
                          className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 px-3 md:px-4 py-2.5 md:py-3 rounded-xl hover:from-primary-50 hover:to-cyan-50 hover:text-primary-600 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg border border-gray-200 hover:border-primary-200"
                          title="View Details"
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>

                      {/* Stock Status */}
                      {product.stock !== undefined && (
                        <div className="mt-2.5 flex items-center">
                          {product.stock > 0 ? (
                            <span className="text-xs text-green-600 font-medium flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                              In Stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                              Out of Stock
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none rounded-2xl"></div>
                    
                    {/* Water Drop Glow Effect */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-6 md:mt-8">
                <Link
                  to="/products"
                  className="inline-flex items-center px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 via-cyan-600 to-primary-600 text-white font-bold rounded-full hover:from-primary-700 hover:via-cyan-700 hover:to-primary-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-sm md:text-base relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">View All Products</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 relative z-10 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {/* Button Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💧</div>
              <p className="text-gray-500 text-lg">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section - Premium Design */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white via-cyan-50/40 via-blue-50/50 to-white relative overflow-hidden">
        {/* Enhanced Water Wave Background Effects */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="absolute top-0 left-0 w-full h-32 text-cyan-400" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,30 600,90 900,60 C1050,45 1125,75 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-15"></div>
          <div className="absolute bottom-1/4 left-10 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-15"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Compact Section Header */}
          <div className="text-center mb-4 md:mb-5">
            <div className="inline-flex items-center justify-center mb-1">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 flex items-center justify-center shadow-lg mr-2">
                <span className="text-xl md:text-2xl">💬</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                What Our Customers Say
              </h2>
            </div>
            <p className="text-gray-600 text-xs md:text-sm max-w-xl mx-auto mt-1">
              Real experiences from our valued customers
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <div className="h-1 w-1.5 bg-cyan-500 rounded-full"></div>
              <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-cyan-500"></div>
            </div>
          </div>

          {/* Premium Testimonials Slider */}
          <div className="relative max-w-7xl mx-auto">
            {/* Slider Container with Gradient Border */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-cyan-50/30 backdrop-blur-sm p-1 shadow-2xl border border-cyan-100/50">
              <div className="relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-md">
                <div 
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                >
                  {/* Mobile: 1 testimonial per slide, Tablet: 2 per slide, Desktop: 3 per slide */}
                  {[...Array(totalSlides)].map((_, slideIndex) => (
                    <div key={slideIndex} className="min-w-full p-3 md:p-4">
                      <div className={`grid gap-4 md:gap-5 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                        {testimonials.slice(slideIndex * testimonialsPerSlide, slideIndex * testimonialsPerSlide + testimonialsPerSlide).map((testimonial, idx) => (
                          <div 
                            key={idx} 
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200/50 hover:border-cyan-300/80 p-5 md:p-6 transform hover:-translate-y-1"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            {/* Animated Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 via-blue-50/0 to-cyan-50/0 group-hover:from-cyan-50/50 group-hover:via-blue-50/30 group-hover:to-cyan-50/50 transition-all duration-500"></div>
                            
                            {/* Water Ripple Effect */}
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-cyan-400/10 blur-2xl"></div>
                            </div>

                            {/* Decorative Quote Icon */}
                            <div className="absolute top-4 right-4 text-cyan-100 text-5xl md:text-6xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500 font-serif">
                              "
                            </div>

                            {/* Top Decorative Line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Stars Rating with Animation */}
                            <div className="flex items-center space-x-1 mb-4 relative z-10">
                              {[...Array(5)].map((_, i) => (
                                <FiStar 
                                  key={i} 
                                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
                                  style={{ transitionDelay: `${i * 50}ms` }}
                                />
                              ))}
                              <span className="ml-2 text-xs text-gray-500 font-medium">5.0</span>
                            </div>

                            {/* Testimonial Text */}
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-5 relative z-10 italic font-medium line-clamp-4 group-hover:text-gray-800 transition-colors">
                              "{testimonial.text}"
                            </p>

                            {/* Customer Info with Enhanced Design */}
                            <div className="flex items-center space-x-3 relative z-10 pt-4 border-t border-gray-200/50 group-hover:border-cyan-200 transition-colors">
                              <div className="relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                                <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-base md:text-lg shadow-xl ring-4 ${testimonial.ring} ring-opacity-50 group-hover:ring-opacity-100 group-hover:scale-110 transition-all duration-300`}>
                                  {testimonial.initials}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 group-hover:text-cyan-700 transition-colors">{testimonial.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <p className="text-gray-500 text-xs md:text-sm">{testimonial.location}</p>
                                </div>
                              </div>
                            </div>

                            {/* Water Drop Decoration with Animation */}
                            <div className="absolute bottom-3 right-3 text-3xl opacity-5 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500">💧</div>
                            
                            {/* Shine Effect on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10 pointer-events-none rounded-2xl"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Navigation Buttons */}
            <button
              onClick={() => setTestimonialIndex((prev) => prev === 0 ? totalSlides - 1 : prev - 1)}
              className="absolute left-2 md:-left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-lg hover:bg-white text-cyan-600 p-3 md:p-4 rounded-full shadow-2xl transition-all hover:scale-125 active:scale-95 z-30 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-cyan-500/50 group"
              aria-label="Previous testimonials"
            >
              <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6 transform group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => setTestimonialIndex((prev) => prev === totalSlides - 1 ? 0 : prev + 1)}
              className="absolute right-2 md:-right-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-lg hover:bg-white text-cyan-600 p-3 md:p-4 rounded-full shadow-2xl transition-all hover:scale-125 active:scale-95 z-30 border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-cyan-500/50 group"
              aria-label="Next testimonials"
            >
              <FiChevronRight className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Enhanced Indicator Dots */}
            <div className="flex justify-center items-center space-x-3 mt-6 md:mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialIndex(index)}
                  className={`transition-all rounded-full ${
                    index === testimonialIndex
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 w-10 md:w-12 h-3 md:h-3.5 shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-300 w-3 h-3 md:w-3.5 md:h-3.5 hover:bg-cyan-400 hover:w-4 hover:h-4 hover:shadow-md'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section - Water Purifier, Kitchen Appliances, Accessories */}
      <section className="py-6 md:py-8 bg-gradient-to-b from-white via-blue-50/20 via-cyan-50/30 to-white relative overflow-hidden">
        {/* Water Wave Background Effects */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="absolute top-0 left-0 w-full h-24 text-cyan-400" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,30 600,90 900,60 C1050,45 1125,75 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
          <div className="absolute top-1/4 right-10 w-56 h-56 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-1/4 left-10 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Compact Section Header */}
          <div className="text-center mb-4 md:mb-5">
            <div className="inline-flex items-center justify-center mb-1">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600 flex items-center justify-center shadow-md mr-2">
                <span className="text-lg md:text-xl">💧</span>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Our Product Categories
              </h2>
            </div>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <div className="h-0.5 w-6 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <div className="h-1 w-1.5 bg-cyan-500 rounded-full"></div>
              <div className="h-0.5 w-6 bg-gradient-to-l from-transparent to-cyan-500"></div>
            </div>
          </div>

          {/* Product Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-7xl mx-auto">
            {/* Dynamic Category Cards - Show first 3 categories */}
            {categories.slice(0, 3).map((category, index) => {
              // Find category by name (case-insensitive) for hardcoded content
              const categoryConfigs = [
                {
                  name: 'Water Purifier',
                  searchTerms: ['water', 'purifier', 'filter'],
                  emoji: '💧',
                  gradient: 'from-cyan-400 to-blue-500',
                  hoverGradient: 'from-cyan-600 to-blue-600',
                  hoverGradientHover: 'from-cyan-700 to-blue-700',
                  borderHover: 'hover:border-cyan-300',
                  textHover: 'group-hover:text-cyan-700',
                  bgGradient: 'from-cyan-50 via-blue-50 to-cyan-100',
                  rippleGradient: 'from-cyan-400/5 via-blue-400/5 to-cyan-400/5',
                  description: 'Your trusted destination for clean, safe drinking water. Advanced purifiers that eliminate harmful impurities while retaining essential minerals.',
                  features: [
                    'Eliminate contaminants like chlorine, bacteria, viruses, and heavy metals',
                    'Retain essential minerals for your health'
                  ]
                },
                {
                  name: 'Kitchen Appliances',
                  searchTerms: ['kitchen', 'appliance'],
                  emoji: '🍳',
                  gradient: 'from-purple-400 to-pink-500',
                  hoverGradient: 'from-purple-600 to-pink-600',
                  hoverGradientHover: 'from-purple-700 to-pink-700',
                  borderHover: 'hover:border-purple-300',
                  textHover: 'group-hover:text-purple-700',
                  bgGradient: 'from-purple-50 via-pink-50 to-orange-50',
                  rippleGradient: 'from-purple-400/5 via-pink-400/5 to-orange-400/5',
                  description: 'Your one‑stop shop for modern kitchen appliances. From powerful blenders and sleek toasters to intuitive multicookers designed to simplify daily routines and elevate every meal.',
                  features: [
                    'Top‑quality craftsmanship with user‑friendly design cook smarter, not harder.'
                  ]
                },
                {
                  name: 'Purifier Accessories',
                  searchTerms: ['accessory', 'accessories', 'purifier'],
                  emoji: '🔧',
                  gradient: 'from-teal-400 to-cyan-500',
                  hoverGradient: 'from-teal-600 to-cyan-600',
                  hoverGradientHover: 'from-teal-700 to-cyan-700',
                  borderHover: 'hover:border-teal-300',
                  textHover: 'group-hover:text-teal-700',
                  bgGradient: 'from-teal-50 via-cyan-50 to-blue-50',
                  rippleGradient: 'from-teal-400/5 via-cyan-400/5 to-blue-400/5',
                  description: 'Premium accessories engineered for optimal performance. From long‑lasting replacement filters and smart taps to installation kits and advanced sensing valves.',
                  features: [
                    'Ensure clean, healthy water flow with minimal upkeep. Make your purifier more efficient, reliable, and hassle‑free.'
                  ]
                }
              ];

              const config = categoryConfigs[index] || {
                name: category.name,
                emoji: '💧',
                gradient: 'from-blue-400 to-cyan-500',
                hoverGradient: 'from-blue-600 to-cyan-600',
                hoverGradientHover: 'from-blue-700 to-cyan-700',
                borderHover: 'hover:border-blue-300',
                textHover: 'group-hover:text-blue-700',
                bgGradient: 'from-blue-50 via-cyan-50 to-blue-50',
                rippleGradient: 'from-blue-400/5 via-cyan-400/5 to-blue-400/5',
                description: category.description || 'Explore our premium products in this category.',
                features: []
              };

              return (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-cyan-300 transform hover:-translate-y-1 block"
                >
                  {/* Water Ripple Effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${config.rippleGradient} blur-xl`}></div>
                  </div>

                  {/* Image Container - Compact */}
                  <div className={`relative h-40 md:h-44 overflow-hidden bg-gradient-to-br ${config.bgGradient}`}>
                    {category.image && category.image.trim() && category.image.length > 10 && (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {/* Fallback Emoji */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl md:text-7xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300">{config.emoji}</div>
                    </div>
                    <div className="absolute top-2 right-2 text-2xl opacity-10 group-hover:opacity-15 transition-opacity">{config.emoji}</div>
                  </div>

                  {/* Content - Compact */}
                  <div className="p-4 md:p-5 relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
                        <span className="text-base">{config.emoji}</span>
                      </div>
                      <h3 className={`text-lg md:text-xl font-bold text-gray-900 ${config.textHover} transition-colors`}>
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-3 line-clamp-3">
                      {config.description}
                    </p>
                    {config.features.length > 0 && (
                      <ul className="space-y-1.5 mb-3">
                        {config.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5 text-xs md:text-sm text-gray-700">
                            <span className={`mt-0.5 text-sm`} style={{ color: config.gradient.includes('cyan') ? '#06b6d4' : config.gradient.includes('purple') ? '#a855f7' : '#14b8a6' }}>✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${config.hoverGradient} hover:brightness-110 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105`}>
                      Explore
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section - Similar to CategoryGrid with Colorful Background */}
      <section className="w-full bg-gradient-to-br from-blue-400 via-purple-500 via-pink-500 to-cyan-400 py-6 md:py-8 relative overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Water Wave Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,30 600,90 900,60 C1050,45 1125,75 1200,60 L1200,120 L0,120 Z" fill="white" opacity="0.3"></path>
            <path d="M0,80 C300,50 600,110 900,80 C1050,65 1125,95 1200,80 L1200,120 L0,120 Z" fill="white" opacity="0.2"></path>
          </svg>
        </div>

        <div className="container mx-auto px-3 md:px-4 relative z-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-2 md:p-3 bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl shadow-lg animate-pulse">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mb-1.5 md:mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.slice(0, 6).map((category, index) => {
                const hasValidImage = category.image && 
                                      category.image.trim() && 
                                      category.image.length > 10 &&
                                      !category.image.includes('placeholder') &&
                                      (category.image.startsWith('http') || category.image.startsWith('data:image/'));
                
                // Different gradient backgrounds for each category card
                const cardGradients = [
                  'from-blue-500/90 to-cyan-500/90',
                  'from-purple-500/90 to-pink-500/90',
                  'from-green-500/90 to-emerald-500/90',
                  'from-orange-500/90 to-red-500/90',
                  'from-indigo-500/90 to-purple-500/90',
                  'from-teal-500/90 to-cyan-500/90'
                ];
                
                return (
                  <Link
                    key={category._id}
                    to={`/products?category=${category._id}`}
                    className="group flex flex-col items-center justify-center p-2 md:p-3 bg-white/95 backdrop-blur-md rounded-lg md:rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-white/50 hover:border-white cursor-pointer"
                  >
                    {/* Round Image - Same size as CategoryGrid icons */}
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full mb-1.5 md:mb-2 overflow-hidden bg-gradient-to-br from-blue-100 via-cyan-100 to-primary-100 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-xl flex items-center justify-center ring-2 ring-white/50 group-hover:ring-white">
                      {hasValidImage ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = e.target.parentElement.querySelector('.category-image-placeholder');
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="category-image-placeholder w-full h-full flex items-center justify-center text-2xl md:text-3xl bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
                          💧
                        </div>
                      )}
                      {/* Ripple Effect on Hover */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${cardGradients[index % cardGradients.length]} opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300`}></div>
                    </div>
                    
                    {/* Category Name */}
                    <span className="text-[10px] md:text-xs font-bold text-gray-800 group-hover:text-primary-700 text-center leading-tight transition-colors duration-300 line-clamp-2 drop-shadow-sm">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 drop-shadow-lg">💧</div>
              <p className="text-white text-sm font-medium drop-shadow-md">No categories available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

