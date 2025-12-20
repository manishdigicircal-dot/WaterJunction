import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getTranslation } from '../../utils/translations';
import { 
  FiHome, 
  FiPackage, 
  FiFolder, 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiArrowRight,
  FiShield,
  FiCheckCircle
} from 'react-icons/fi';
import { FaLinkedin, FaPinterest } from 'react-icons/fa';

const Footer = () => {
  const { language } = useSelector((state) => state.language);

  return (
    <footer className="relative mt-auto bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Water Wave Background */}
      <div className="absolute top-0 left-0 w-full h-24 opacity-40">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,30 600,90 900,60 C1050,45 1125,75 1200,60 L1200,0 L0,0 Z" fill="url(#wave-gradient)" opacity="0.9"></path>
          <path d="M0,80 C300,50 600,110 900,80 C1050,65 1125,95 1200,80 L1200,0 L0,0 Z" fill="url(#wave-gradient)" opacity="0.7"></path>
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center mb-5 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300"></div>
                <img 
                  src="/images/logo-waterjuction.webp" 
                  alt="Water Junction Logo" 
                  className="relative h-12 md:h-14 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (!e.target.nextSibling) {
                      const fallback = document.createElement('div');
                      fallback.className = 'relative w-14 h-14';
                      fallback.innerHTML = `
                        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div class="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-2 ring-cyan-500/30">💧</div>
                      `;
                      e.target.parentElement.insertBefore(fallback, e.target);
                    }
                  }}
                />
              </div>
            </Link>
            <p className="text-gray-300 mb-5 leading-relaxed text-sm">
              Your trusted partner for premium water purification solutions. Pure water, pure life.
            </p>
            
            {/* Social Media Icons - Enhanced */}
            <div className="flex items-center space-x-2.5 flex-wrap gap-2.5">
              <a 
                href="https://m.facebook.com/100064208972435/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 border border-blue-500/30 overflow-hidden"
                aria-label="Facebook"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                <FiFacebook className="w-5 h-5 relative z-10" />
              </a>
              
              <a 
                href="https://www.instagram.com/waterjunction/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-600 via-purple-600 to-pink-600 flex items-center justify-center hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 border border-pink-500/30 overflow-hidden"
                aria-label="Instagram"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                <FiInstagram className="w-5 h-5 relative z-10" />
              </a>
              
              
              
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center group">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Quick Links</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiHome className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">{getTranslation('home', language)}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/products" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiPackage className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">{getTranslation('products', language)}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/categories" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiFolder className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">{getTranslation('categories', language)}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiArrowRight className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">{getTranslation('contact', language)}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service - Enhanced */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center group">
              <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Customer Service</span>
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/orders" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiPackage className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">{getTranslation('orders', language)}</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/wishlist" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiCheckCircle className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">Wishlist</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiPackage className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">Cart</span>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center text-gray-300 hover:text-cyan-400 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform border border-cyan-500/20">
                    <FiShield className="w-4 h-4 text-cyan-400/70 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="group-hover:font-semibold transition-all">FAQs</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info - Enhanced */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center group">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mr-3 group-hover:scale-110 transition-transform"></span>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Contact Us</span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform border border-cyan-500/30 shadow-lg">
                  <FiMail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Email</p>
                  <a href="mailto:waterjunction514@gmail.com" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors break-all font-medium hover:underline">
                    waterjunction514@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform border border-cyan-500/30 shadow-lg">
                  <FiPhone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Phone</p>
                  <a href="tel:+919560121045" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors font-medium hover:underline">
                    +91 9560121045
                  </a>
                </div>
              </li>
              <li className="flex items-start group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform border border-cyan-500/30 shadow-lg">
                  <FiMapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Address</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Ground Floor, Khasra No - 146,<br />
                    Dudeshwar Enclave, Vill - Chipiana Tigri,
                    Opposite - 14th Avenue, Gaur City,
                    Gautam Buddha Nagar,
                    Uttar Pradesh, 201301
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="border-t border-gray-700/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} <span className="text-cyan-400 font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">WaterJunction</span>. All rights reserved. | Designed & Developed with ❤️ by  
<a href="https://digicircal.com" target="_blank" rel="noopener"> Digicircal</a>
            </p>
            <div className="flex items-center flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline font-medium">
                Terms & Conditions
              </Link>
              <Link to="/refund" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 hover:underline font-medium">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Water Wave */}
      <div className="absolute bottom-0 left-0 w-full h-20 opacity-25 rotate-180">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C300,30 600,90 900,60 C1050,45 1125,75 1200,60 L1200,120 L0,120 Z" fill="url(#wave-gradient-bottom)" opacity="0.8"></path>
          <defs>
            <linearGradient id="wave-gradient-bottom" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
