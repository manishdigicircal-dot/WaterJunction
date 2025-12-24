import { FiUsers, FiTruck, FiShield, FiAward, FiRefreshCw } from 'react-icons/fi';

const FeaturesBar = () => {
  const features = [
    {
      icon: FiUsers,
      text: '1L+ Happy Customers',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiTruck,
      text: 'Free Shipping',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiShield,
      text: 'Secure Payment',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiAward,
      text: 'Premium Quality',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FiRefreshCw,
      text: 'Easy Returns',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="w-full bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-y border-cyan-200/50 py-3 md:py-4 relative overflow-hidden">
      {/* Water Wave Animation Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.1),transparent)] animate-[shimmer_3s_infinite]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-3 group cursor-default"
              >
                {/* Icon with Gradient Background */}
                <div className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  {/* Ripple Effect */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-50 animate-ping`}></div>
                </div>
                
                {/* Text */}
                <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-300 leading-tight text-center md:text-left whitespace-nowrap">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;


const FeaturesBar = () => {
  const features = [
    {
      icon: FiUsers,
      text: '1L+ Happy Customers',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FiTruck,
      text: 'Free Shipping',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FiShield,
      text: 'Secure Payment',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FiAward,
      text: 'Premium Quality',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FiRefreshCw,
      text: 'Easy Returns',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <section className="w-full bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border-y border-cyan-200/50 py-3 md:py-4 relative overflow-hidden">
      {/* Water Wave Animation Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.1),transparent)] animate-[shimmer_3s_infinite]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-3 group cursor-default"
              >
                {/* Icon with Gradient Background */}
                <div className={`relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 flex-shrink-0`}>
                  <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  {/* Ripple Effect */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-50 animate-ping`}></div>
                </div>
                
                {/* Text */}
                <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-gray-800 group-hover:text-primary-600 transition-colors duration-300 leading-tight text-center md:text-left whitespace-nowrap">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;

