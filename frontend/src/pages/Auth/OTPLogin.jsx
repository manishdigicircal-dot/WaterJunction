import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, verifyOTP } from '../../store/slices/authSlice';
import { syncGuestCart } from '../../store/slices/cartSlice';
import { getTranslation } from '../../utils/translations';
import toast from 'react-hot-toast';

const OTPLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language } = useSelector((state) => state.language);
  const { loading } = useSelector((state) => state.auth);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await dispatch(sendOTP(phone)).unwrap();
      toast.success('OTP sent successfully!');
      setStep('otp');
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await dispatch(verifyOTP({ phone, otp })).unwrap();
      // Sync guest cart to backend after OTP login
      try {
        await dispatch(syncGuestCart()).unwrap();
      } catch (cartError) {
        console.error('Cart sync error:', cartError);
      }
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error || 'Invalid OTP');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Login with Phone/OTP
        </h2>

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {getTranslation('phone', language)}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 9876543210"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
                placeholder="000000"
                className="input-field text-center text-2xl tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-primary-600 hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-600">
          <Link to="/login" className="text-primary-600 hover:underline">
            Back to Email Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OTPLogin;

