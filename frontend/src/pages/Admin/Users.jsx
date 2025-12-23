import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiUser, FiShield, FiSlash, FiCheckCircle } from 'react-icons/fi';

import { API_URL } from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/block`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success(`User ${currentStatus ? 'unblocked' : 'blocked'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="text-gray-500 mt-1">Manage user roles, status, and accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user) => {
          const isAdmin = user.role === 'admin';
          const isBlocked = user.isBlocked;
          const firstLetter = (user.name || 'A').charAt(0).toUpperCase();
          const avatarSrc = user.profilePhoto;

          return (
            <div
              key={user._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-lg font-bold ring-4 ring-cyan-100 overflow-hidden shadow-md">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{firstLetter}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name || 'N/A'}</p>
                  <div className="flex items-center space-x-2 text-xs mt-1">
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role || 'user'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-semibold ${
                        isBlocked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <FiMail className="text-cyan-500 flex-shrink-0" />
                  <span className="truncate">{user.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiPhone className="text-cyan-500 flex-shrink-0" />
                  <span className="truncate">{user.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <FiUser className="flex-shrink-0" />
                  <span>User ID: {user._id}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <FiShield className={isAdmin ? 'text-purple-600' : 'text-gray-500'} />
                  <span className={isAdmin ? 'text-purple-700' : 'text-gray-600'}>
                    {isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <button
                  onClick={() => handleBlock(user._id, user.isBlocked)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    user.isBlocked
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {user.isBlocked ? (
                    <span className="flex items-center space-x-1">
                      <FiCheckCircle />
                      <span>Unblock</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <FiSlash />
                      <span>Block</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsers;


