import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../store/slices/dataSlice';
import { 
  FiDroplet, 
  FiFilter, 
  FiThermometer,
  FiZap,
  FiCoffee,
  FiPackage
} from 'react-icons/fi';

const CategoryGrid = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get categories from Redux store with separate selectors to prevent rerenders
  const allCategories = useSelector((state) => state.data.categories || []);
  const loading = useSelector((state) => state.data.loading.categories);

  // Category mapping - name to icon and color
  const categoryConfig = {
    'Water Purifier': {
      icon: FiDroplet,
      color: 'from-blue-500 to-cyan-500',
      keywords: ['water purifier', 'purifier', 'water-purifier']
    },
    'Water Softener': {
      icon: FiFilter,
      color: 'from-purple-500 to-pink-500',
      keywords: ['water softener', 'softener', 'water-softener']
    },
    'Water Dispenser': {
      icon: FiThermometer,
      color: 'from-green-500 to-emerald-500',
      keywords: ['water dispenser', 'dispenser', 'water-dispenser']
    },
    'Water Heater': {
      icon: FiZap,
      color: 'from-orange-500 to-red-500',
      keywords: ['water heater', 'heater', 'geyser', 'water-heater']
    },
    'Kitchen Appliances': {
      icon: FiCoffee,
      color: 'from-indigo-500 to-purple-500',
      keywords: ['kitchen', 'kitchen appliances', 'appliances']
    },
    'Water Purifier Accessories': {
      icon: FiPackage,
      color: 'from-teal-500 to-cyan-500',
      keywords: ['accessories', 'purifier accessories', 'water purifier accessories']
    }
  };

  // Fetch categories only once, Redux will handle caching
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Map categories based on name matching - memoized to avoid recalculation
  const mappedCategories = useMemo(() => {
    if (!allCategories || allCategories.length === 0) {
      return [];
    }

    const mapped = [];
    const categoryOrder = [
      'Water Purifier',
      'Water Softener',
      'Water Dispenser',
      'Water Heater',
      'Kitchen Appliances',
      'Water Purifier Accessories'
    ];

    categoryOrder.forEach(categoryName => {
      const config = categoryConfig[categoryName];
      if (config) {
        // Find matching category from API
        const matchedCategory = allCategories.find(cat => {
          const catNameLower = cat.name.toLowerCase();
          return config.keywords.some(keyword => 
            catNameLower.includes(keyword.toLowerCase())
          );
        });

        if (matchedCategory) {
          mapped.push({
            ...matchedCategory,
            icon: config.icon,
            color: config.color,
            displayName: categoryName === 'Water Heater' ? 'Water Heater (Geyser)' : categoryName
          });
        }
      }
    });

    // If we don't have all 6, add remaining from API
    if (mapped.length < 6 && allCategories.length > 0) {
      allCategories.forEach(cat => {
        if (!mapped.find(m => m._id === cat._id) && mapped.length < 6) {
          mapped.push({
            ...cat,
            icon: FiPackage,
            color: 'from-gray-500 to-gray-600',
            displayName: cat.name
          });
        }
      });
    }

    return mapped.slice(0, 6);
  }, [allCategories]);

  const categories = mappedCategories;

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-white via-blue-50/30 to-transparent py-3 md:py-4 border-b border-gray-100">
        <div className="container mx-auto px-3 md:px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative p-[2px] rounded-lg md:rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 animate-pulse">
                <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-white rounded-lg md:rounded-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mb-1.5 md:mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-white via-blue-50/30 to-transparent py-3 md:py-4 border-b border-gray-100">
      <div className="container mx-auto px-3 md:px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {categories.map((category, index) => {
            const IconComponent = category.icon || FiPackage;
            return (
              <div
                key={`${category._id || 'cat'}-${index}`}
                className="relative p-[2px] rounded-lg md:rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl"
              >
                <button
                  onClick={() => {
                    navigate(`/products?category=${category._id}`, { replace: false });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group w-full h-full flex flex-col items-center justify-center p-2 md:p-3 bg-white rounded-lg md:rounded-xl cursor-pointer"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${category.color || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-1.5 md:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg ring-2 ring-blue-100 group-hover:ring-blue-300`}>
                    <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center leading-tight transition-colors duration-300 line-clamp-2">
                    {category.displayName || category.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../store/slices/dataSlice';
import { 
  FiDroplet, 
  FiFilter, 
  FiThermometer,
  FiZap,
  FiCoffee,
  FiPackage
} from 'react-icons/fi';

const CategoryGrid = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get categories from Redux store with separate selectors to prevent rerenders
  const allCategories = useSelector((state) => state.data.categories || []);
  const loading = useSelector((state) => state.data.loading.categories);

  // Category mapping - name to icon and color
  const categoryConfig = {
    'Water Purifier': {
      icon: FiDroplet,
      color: 'from-blue-500 to-cyan-500',
      keywords: ['water purifier', 'purifier', 'water-purifier']
    },
    'Water Softener': {
      icon: FiFilter,
      color: 'from-purple-500 to-pink-500',
      keywords: ['water softener', 'softener', 'water-softener']
    },
    'Water Dispenser': {
      icon: FiThermometer,
      color: 'from-green-500 to-emerald-500',
      keywords: ['water dispenser', 'dispenser', 'water-dispenser']
    },
    'Water Heater': {
      icon: FiZap,
      color: 'from-orange-500 to-red-500',
      keywords: ['water heater', 'heater', 'geyser', 'water-heater']
    },
    'Kitchen Appliances': {
      icon: FiCoffee,
      color: 'from-indigo-500 to-purple-500',
      keywords: ['kitchen', 'kitchen appliances', 'appliances']
    },
    'Water Purifier Accessories': {
      icon: FiPackage,
      color: 'from-teal-500 to-cyan-500',
      keywords: ['accessories', 'purifier accessories', 'water purifier accessories']
    }
  };

  // Fetch categories only once, Redux will handle caching
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Map categories based on name matching - memoized to avoid recalculation
  const mappedCategories = useMemo(() => {
    if (!allCategories || allCategories.length === 0) {
      return [];
    }

    const mapped = [];
    const categoryOrder = [
      'Water Purifier',
      'Water Softener',
      'Water Dispenser',
      'Water Heater',
      'Kitchen Appliances',
      'Water Purifier Accessories'
    ];

    categoryOrder.forEach(categoryName => {
      const config = categoryConfig[categoryName];
      if (config) {
        // Find matching category from API
        const matchedCategory = allCategories.find(cat => {
          const catNameLower = cat.name.toLowerCase();
          return config.keywords.some(keyword => 
            catNameLower.includes(keyword.toLowerCase())
          );
        });

        if (matchedCategory) {
          mapped.push({
            ...matchedCategory,
            icon: config.icon,
            color: config.color,
            displayName: categoryName === 'Water Heater' ? 'Water Heater (Geyser)' : categoryName
          });
        }
      }
    });

    // If we don't have all 6, add remaining from API
    if (mapped.length < 6 && allCategories.length > 0) {
      allCategories.forEach(cat => {
        if (!mapped.find(m => m._id === cat._id) && mapped.length < 6) {
          mapped.push({
            ...cat,
            icon: FiPackage,
            color: 'from-gray-500 to-gray-600',
            displayName: cat.name
          });
        }
      });
    }

    return mapped.slice(0, 6);
  }, [allCategories]);

  const categories = mappedCategories;

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-white via-blue-50/30 to-transparent py-3 md:py-4 border-b border-gray-100">
        <div className="container mx-auto px-3 md:px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative p-[2px] rounded-lg md:rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 animate-pulse">
                <div className="flex flex-col items-center justify-center p-2 md:p-3 bg-white rounded-lg md:rounded-xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 mb-1.5 md:mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-b from-white via-blue-50/30 to-transparent py-3 md:py-4 border-b border-gray-100">
      <div className="container mx-auto px-3 md:px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {categories.map((category, index) => {
            const IconComponent = category.icon || FiPackage;
            return (
              <div
                key={`${category._id || 'cat'}-${index}`}
                className="relative p-[2px] rounded-lg md:rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl"
              >
                <button
                  onClick={() => {
                    navigate(`/products?category=${category._id}`, { replace: false });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group w-full h-full flex flex-col items-center justify-center p-2 md:p-3 bg-white rounded-lg md:rounded-xl cursor-pointer"
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${category.color || 'from-gray-500 to-gray-600'} flex items-center justify-center mb-1.5 md:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg ring-2 ring-blue-100 group-hover:ring-blue-300`}>
                    <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center leading-tight transition-colors duration-300 line-clamp-2">
                    {category.displayName || category.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
