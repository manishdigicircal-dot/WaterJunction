import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiBox,
  FiActivity,
  FiTag,
  FiCheckCircle,
  FiClock,
  FiFolder
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        timeout: 30000 // 30 second timeout
      });
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        console.error('Invalid stats response:', data);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set stats to null to show error message
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-red-600 text-sm mb-4">Please refresh the page or try again later.</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchStats();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue?.total?.toLocaleString() || 0}`,
      sub: `Monthly: ₹${stats.revenue?.monthly?.toLocaleString() || 0}`,
      icon: FiTrendingUp,
      gradient: 'from-cyan-500 to-blue-600',
      text: 'text-white'
    },
    {
      title: 'Total Orders',
      value: stats.orders || 0,
      sub: `Delivered: ${stats.orderStats?.delivered || 0}`,
      icon: FiShoppingBag,
      gradient: 'from-amber-500 to-orange-600',
      text: 'text-white'
    },
    {
      title: 'Total Users',
      value: stats.users || 0,
      sub: `Active: ${stats.usersActive || 0}`,
      icon: FiUsers,
      gradient: 'from-purple-500 to-pink-600',
      text: 'text-white'
    },
    {
      title: 'Total Products',
      value: stats.products || 0,
      sub: `Categories: ${stats.categories || stats.categoryCount || 0}`,
      icon: FiBox,
      gradient: 'from-emerald-500 to-teal-600',
      text: 'text-white'
    }
  ];

  const statusData = [
    { name: 'Pending', value: stats.orderStats?.pending || 0, color: 'text-amber-600 bg-amber-50' },
    { name: 'Paid', value: stats.orderStats?.paid || 0, color: 'text-blue-600 bg-blue-50' },
    { name: 'Shipped', value: stats.orderStats?.shipped || 0, color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Delivered', value: stats.orderStats?.delivered || 0, color: 'text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Overview of sales, orders, users, and products</p>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <span className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <FiActivity className="text-cyan-600" />
            <span>Real-time stats</span>
          </span>
          <span className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <FiClock className="text-amber-500" />
            <span>Updated</span>
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ title, value, sub, icon: Icon, gradient, text }) => (
          <div
            key={title}
            className={`rounded-2xl p-5 shadow-lg bg-gradient-to-br ${gradient} ${text} relative overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_#fff,_transparent_50%)]"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm opacity-90">{title}</p>
                <p className="text-3xl font-extrabold mt-2">{value}</p>
                <p className="text-xs mt-1 opacity-90">{sub}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status + Category/User Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FiTag className="text-cyan-600" />
            <span>Order Status</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusData.map((s) => (
              <div key={s.name} className={`p-4 rounded-xl ${s.color} border border-gray-100 shadow-sm`}>
                <p className="text-sm">{s.name}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.categories || stats.categoryCount || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-inner">
                <FiFolder />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.usersActive || stats.users || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-inner">
                <FiUsers />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue (Monthly)</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <LineChart data={stats.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Orders (Monthly)</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <BarChart data={stats.orderChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Sales</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts?.slice(0, 10).map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">₹{product.price?.toLocaleString()}</td>
                    <td className="p-2">{product.sales || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2">Order #</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.slice(0, 10).map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">#{order.orderNumber}</td>
                    <td className="p-2">{order.user?.name || 'N/A'}</td>
                    <td className="p-2">₹{order.total?.toLocaleString()}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


