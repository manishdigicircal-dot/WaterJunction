import { FiCheckCircle, FiShield, FiRefreshCw, FiPackage } from 'react-icons/fi';

const Terms = () => {
  const points = [
    {
      icon: FiCheckCircle,
      title: 'Acceptance',
      text: 'By using this website you agree to these Terms & Conditions and our Privacy Policy.'
    },
    {
      icon: FiPackage,
      title: 'Orders & Pricing',
      text: 'Product availability, pricing, and offers may change without notice. Orders are confirmed only after payment and acceptance.'
    },
    {
      icon: FiRefreshCw,
      title: 'Returns & Refunds',
      text: 'Returns and refunds are governed by our Refund Policy. Items must be unused, in original packaging, and within the stated return window.'
    },
    {
      icon: FiShield,
      title: 'Liability & Use',
      text: 'Use products as instructed. We are not liable for misuse or third-party links. All content is owned by Water Junction.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M0,400 C300,300 600,500 900,400 C1050,350 1125,450 1200,400 L1200,800 L0,800 Z" fill="url(#wave-gradient-terms)" opacity="0.35"></path>
          <defs>
            <linearGradient id="wave-gradient-terms" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-14 relative z-10">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-full blur-xl opacity-40"></div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 flex items-center justify-center text-2xl text-white shadow-2xl ring-4 ring-cyan-100">
                  📜
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-gray-600 mt-2">Please read these terms before using Water Junction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {points.map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center mr-3 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>1) Account & Security: Keep credentials confidential. You are responsible for activities under your account.</p>
            <p>2) Payments: Secure payment gateways are used. Billing details must be accurate.</p>
            <p>3) Shipping: Delivery timelines are estimates. Delays may occur due to logistics or external factors.</p>
            <p>4) Warranty & Service: Manufacturer or seller warranty terms apply where stated.</p>
            <p>5) Content: All logos, text, graphics are property of Water Junction. Do not copy without permission.</p>
            <p>6) Policy Updates: Terms may change. Continued use implies acceptance of updated terms.</p>
            <p className="font-semibold text-gray-900">For questions, contact: <a className="text-cyan-600 hover:underline" href="mailto:waterjunction514@gmail.com">waterjunction514@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;



