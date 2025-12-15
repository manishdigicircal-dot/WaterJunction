import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiArrowRight,
  FiPrinter
} from 'react-icons/fi';
import ReactToPrint from 'react-to-print';
import { useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  paid: 'bg-blue-100 text-blue-700 border-blue-200',
  packed: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200'
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const summary = useMemo(() => {
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    return [
      { label: 'Total Orders', value: total, icon: FiPackage, gradient: 'from-cyan-500 to-blue-600' },
      { label: 'Pending', value: pending, icon: FiClock, gradient: 'from-amber-500 to-orange-500' },
      { label: 'Shipped', value: shipped, icon: FiTruck, gradient: 'from-indigo-500 to-blue-600' },
      { label: 'Delivered', value: delivered, icon: FiCheckCircle, gradient: 'from-emerald-500 to-teal-600' }
    ];
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-gray-500 mt-1">Track, update, and review all orders</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.map(({ label, value, icon: Icon, gradient }) => (
          <div
            key={label}
            className={`rounded-2xl p-4 bg-gradient-to-br ${gradient} text-white shadow-lg relative overflow-hidden`}
          >
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_left,_#fff,_transparent_50%)]"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm opacity-90">{label}</p>
                <p className="text-2xl font-extrabold mt-1">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <FiTruck className="text-cyan-600" />
            <span>All Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiClock className="text-amber-500" />
            <span>Live status update</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Order #</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">#{order.orderNumber}</td>
                  <td className="p-3">{order.user?.name || 'N/A'}</td>
                  <td className="p-3 text-gray-600">{format(new Date(order.createdAt), 'PPp')}</td>
                  <td className="p-3 font-bold text-gray-900">₹{order.total?.toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{order.paymentMethod || 'N/A'}</td>
                  <td className="p-3 text-gray-700">{order.items?.length || 0}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/orders/${order._id}`}
                        className="inline-flex items-center space-x-1 text-cyan-600 hover:text-cyan-700 font-semibold"
                      >
                        <span>View</span>
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={`/orders/${order._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-600 hover:text-cyan-600 transition"
                        title="Print Invoice"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`/orders/${order._id}`, '_blank');
                        }}
                      >
                        <FiPrinter className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;


