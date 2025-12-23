import { useNavigate, Link } from 'react-router-dom';
import { FiXCircle, FiRefreshCw, FiHome, FiShoppingBag } from 'react-icons/fi';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
        {/* Sad Icon */}
        <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6">
          <FiXCircle className="w-20 h-20 text-red-500" />
        </div>

        {/* Main Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          😔 Payment Failed
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          We're sorry, but your payment could not be processed.
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Please try again or use a different payment method.
        </p>

        {/* Reasons */}
        <div className="bg-red-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-red-800 mb-4">Possible reasons:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Card details entered incorrectly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Network connectivity issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Payment gateway temporarily unavailable</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold flex items-center justify-center gap-2"
          >
            <FiRefreshCw />
            Try Again
          </button>
          <Link
            to="/cart"
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2"
          >
            <FiShoppingBag />
            View Cart
          </Link>
          <Link
            to="/products"
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-center flex items-center justify-center gap-2"
          >
            <FiHome />
            Continue Shopping
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            Need help? <Link to="/contact" className="text-blue-600 hover:underline font-semibold">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;






