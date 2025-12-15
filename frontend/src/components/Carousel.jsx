import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageHeight, setImageHeight] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef(null);
  
  // Carousel images - 6 images for desktop and mobile
  const desktopImages = [
    '/carousel/desktop/carousel-desktop-1.png',
    '/carousel/desktop/carousel-desktop-2.png',
    '/carousel/desktop/carousel-desktop-3.png',
    '/carousel/desktop/carousel-desktop-4.png',
  ];

  // For now, reuse desktop images on mobile to avoid missing file 404s in production
  const mobileImages = [
    '/carousel/desktop/carousel-desktop-1.png',
    '/carousel/desktop/carousel-desktop-2.png',
    '/carousel/desktop/carousel-desktop-3.png',
    '/carousel/desktop/carousel-desktop-4.png',
  ];

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get current images array based on screen size
  const images = isMobile ? mobileImages : desktopImages;

  // Handle image load to set height
  const handleImageLoad = (e) => {
    if (e.target && imageRef.current && e.target === imageRef.current) {
      const height = e.target.offsetHeight || e.target.naturalHeight;
      setImageHeight(height);
    }
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Reset height when image changes or screen size changes
  useEffect(() => {
    setImageHeight(null);
  }, [currentIndex, isMobile]);

  // Handle window resize - update height
  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const height = imageRef.current.offsetHeight || imageRef.current.naturalHeight;
        setImageHeight(height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Check if image exists, fallback to placeholder
  const getImageSrc = (src, index) => {
    return src;
  };

  return (
    <div 
      className="relative w-full overflow-hidden shadow-2xl m-0 p-0 bg-transparent"
      style={{ 
        height: imageHeight ? `${imageHeight}px` : 'auto',
        transition: 'height 0.3s ease-in-out',
        display: 'block'
      }}
    >
      {/* Desktop Images */}
      <div className="hidden md:block relative w-full" style={{ 
        height: imageHeight ? `${imageHeight}px` : 'auto',
        lineHeight: 0
      }}>
        {desktopImages.map((image, index) => (
          <div
            key={index}
            className={`transition-opacity duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 relative z-10' 
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            style={{ height: '100%' }}
          >
            {index === currentIndex ? (
              <img
                ref={imageRef}
                src={getImageSrc(image, index)}
                alt={`Carousel ${index + 1}`}
                className="w-full h-auto object-contain block"
                onLoad={handleImageLoad}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (!e.target.nextSibling) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full min-h-[400px] bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center';
                    fallback.innerHTML = `<div class="text-white text-4xl font-bold">Slide ${index + 1}</div>`;
                    e.target.parentElement.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <img
                src={getImageSrc(image, index)}
                alt={`Carousel ${index + 1}`}
                className="w-full h-auto object-contain hidden"
              />
            )}
            {/* Water wave overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-transparent pointer-events-none z-0"></div>
          </div>
        ))}
      </div>

      {/* Mobile Images */}
      <div className="md:hidden relative w-full" style={{ 
        height: imageHeight ? `${imageHeight}px` : 'auto',
        lineHeight: 0
      }}>
        {mobileImages.map((image, index) => (
          <div
            key={index}
            className={`transition-opacity duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 relative z-10' 
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            style={{ height: '100%' }}
          >
            {index === currentIndex ? (
              <img
                ref={imageRef}
                src={getImageSrc(image, index)}
                alt={`Carousel Mobile ${index + 1}`}
                className="w-full h-auto object-contain block"
                onLoad={handleImageLoad}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (!e.target.nextSibling) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full min-h-[300px] bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center';
                    fallback.innerHTML = `<div class="text-white text-3xl font-bold">Slide ${index + 1}</div>`;
                    e.target.parentElement.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <img
                src={getImageSrc(image, index)}
                alt={`Carousel Mobile ${index + 1}`}
                className="w-full h-auto object-contain hidden"
              />
            )}
            {/* Water wave overlay effect for mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-transparent pointer-events-none z-0"></div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white text-primary-600 p-2.5 md:p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 z-20 border-2 border-primary-200 hover:border-primary-400"
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md hover:bg-white text-primary-600 p-2.5 md:p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 z-20 border-2 border-primary-200 hover:border-primary-400"
        aria-label="Next slide"
      >
        <FiChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20 bg-black/30 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentIndex
                ? 'bg-white w-7 md:w-8 h-2 md:h-2.5 shadow-lg'
                : 'bg-white/70 w-2 h-2 md:w-2.5 md:h-2.5 hover:bg-white/90 hover:w-3 hover:h-3'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Water Ripple Effect (Subtle bottom fade) - Removed white gradient */}
    </div>
  );
};

export default Carousel;
