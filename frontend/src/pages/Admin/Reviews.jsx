import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FiCheckCircle, FiXCircle, FiStar, FiUser, FiClock, FiBox } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/reviews/admin/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await axios.put(
        `${API_URL}/reviews/${reviewId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success('Review approved');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await axios.put(
        `${API_URL}/reviews/${reviewId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success('Review rejected');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to reject review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Pending Reviews
          </h1>
          <p className="text-gray-500 mt-1">Review and approve or reject recent submissions</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2">
          <FiClock className="text-amber-500" />
          <span>Updated</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-emerald-600">
            <FiCheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending reviews</h3>
          <p className="text-gray-500">All reviews are processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((review) => {
            const productImg = review.product?.images?.[0];
            const userAvatar = review.user?.profilePhoto;
            const userInitial = (review.user?.name || 'U').charAt(0).toUpperCase();

            return (
              <div
                key={review._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex flex-col"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold ring-4 ring-cyan-100 overflow-hidden shadow">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={review.user?.name || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{review.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                      <FiClock className="text-amber-500" />
                      <span>{format(new Date(review.createdAt), 'PPp')}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-amber-400' : 'text-gray-300'}`}
                        fill={i < review.rating ? '#fbbf24' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="font-semibold text-gray-900">{review.title}</p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-3">{review.comment}</p>
                </div>

                <div className="mt-3 flex items-center space-x-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0">
                    {productImg ? (
                      <img
                        src={productImg}
                        alt={review.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FiBox />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {review.product?.name || 'Product'}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {review.product?._id || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between space-x-3">
                  <button
                    onClick={() => handleApprove(review._id)}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center space-x-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(review._id)}
                    className="flex-1 py-2.5 px-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-all border border-red-200 flex items-center justify-center space-x-2"
                  >
                    <FiXCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;


