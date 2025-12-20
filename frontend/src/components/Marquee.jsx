import { useState } from 'react';
import { FiGift, FiPercent, FiShoppingBag } from 'react-icons/fi';

const Marquee = () => {
  const [isPaused, setIsPaused] = useState(false);

  // ✏️ CUSTOMIZE YOUR MARQUEE TEXT HERE - Easy to edit!
  // Add or remove items, change text, add icons
  const marqueeItems = [
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
    { text: 'Best Price Guaranteed', icon: <FiShoppingBag className="w-4 h-4" /> },
  ];

  // Duplicate items for seamless infinite loop
  const duplicatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <div
      className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 text-white py-2.5 overflow-hidden relative z-50 shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex">
        {/* First set of items */}
        <div
          className={`flex whitespace-nowrap ${
            isPaused ? 'animate-none' : 'animate-marquee'
          }`}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`first-${index}`}
              className="flex items-center space-x-3 mx-6 text-sm md:text-base font-semibold"
            >
              {item.icon && (
                <span className="text-yellow-300 animate-pulse flex items-center">
                  {item.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{item.text}</span>
              <span className="text-white/40 font-thin">|</span>
            </div>
          ))}
        </div>

        {/* Second set for seamless loop */}
        <div
          className={`flex whitespace-nowrap ${
            isPaused ? 'animate-none' : 'animate-marquee'
          }`}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`second-${index}`}
              className="flex items-center space-x-3 mx-6 text-sm md:text-base font-semibold"
            >
              {item.icon && (
                <span className="text-yellow-300 animate-pulse flex items-center">
                  {item.icon}
                </span>
              )}
              <span className="whitespace-nowrap">{item.text}</span>
              <span className="text-white/40 font-thin">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;

