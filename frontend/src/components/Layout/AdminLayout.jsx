import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useEffect, useState } from 'react';
import {
  FiLayout,
  FiPackage,
  FiFolder,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiStar,
  FiLogOut,
  FiSearch
} from 'react-icons/fi';

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    if (user?.profilePhoto) {
      setAvatarKey(Date.now());
    }
  }, [user?.profilePhoto]);

  const getAvatarSrc = () => {
    const raw = user?.profilePhoto;
    if (!raw) return null;
    const photo = raw.trim();
    if (!photo) return null;
    if (photo.startsWith('data:image')) return photo.split('?')[0];
    return `${photo}${photo.includes('?') ? '&' : '?'}v=${avatarKey || Date.now()}`;
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen shadow-2xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-8 flex items-center space-x-2">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg">
                💧
              </span>
              <span>Admin Panel</span>
            </h1>
            <nav className="space-y-2">
              <Link
                to="/admin"
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700/80 transition"
              >
                <FiLayout />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiPackage />
                <span>Products</span>
              </Link>
              <Link
                to="/admin/categories"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiFolder />
                <span>Categories</span>
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiShoppingBag />
                <span>Orders</span>
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiUsers />
                <span>Users</span>
              </Link>
              <Link
                to="/admin/coupons"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiTag />
                <span>Coupons</span>
              </Link>
              <Link
                to="/admin/reviews"
                className="flex items-center space-x-2 p-3 rounded hover:bg-primary-700 transition"
              >
                <FiStar />
                <span>Reviews</span>
              </Link>
              <div className="border-t border-primary-700 mt-4 pt-4">
                <Link
                  to="/"
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-slate-700/80 transition"
                >
                  <span>← Back to Store</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-600/20 transition text-red-100"
                >
                  <span className="flex items-center space-x-2">
                    <FiLogOut />
                    <span className="text-sm">Logout</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {/* Top Bar with search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in admin..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* User avatar only */}
              <div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-base shadow-lg ring-4 ring-cyan-100 overflow-hidden"
                title={user?.name || 'Admin'}
              >
                {user?.profilePhoto ? (
                  <img
                    key={avatarKey}
                    src={getAvatarSrc()}
                    alt={user?.name || 'Admin'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{(user?.name || 'A').charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Logout icon only */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


