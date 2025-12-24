import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiTag, FiClock, FiTrendingUp, FiPercent, FiGift, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';

import { API_URL } from '../../utils/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p classFace="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Active Coupons',
      value: coupons.length,
      icon: FiTag,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'Percentage Type',
      value: coupons.filter((c) => c.type === 'percentage').length,
      icon: FiPercent,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Flat Discounts',
      value: coupons.filter((c) => c.type === 'flat').length,
      icon: FiGift,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Coupons
          </h1>
          <p className="text-gray-500 mt-1">Manage discount codes and their usage</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]">
          <FiPlus />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, gradient }) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiClock className="text-amber-500" />
            <span>Latest coupons</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiShield className="text-emerald-500" />
            <span>Coupons with usage control</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Min Order</th>
                <th className="p-3 text-left">Valid Until</th>
                <th className="p-3 text-left">Usage</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">{coupon.code}</td>
                  <td className="p-3 capitalize">{coupon.type}</td>
                  <td className="p-3">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="p-3">₹{coupon.minOrderValue}</td>
                  <td className="p-3">{coupon.validUntil ? format(new Date(coupon.validUntil), 'PP') : '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-cyan-600 hover:text-cyan-700 p-2 rounded-lg hover:bg-cyan-50">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
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

export default AdminCoupons;



import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiTag, FiClock, FiTrendingUp, FiPercent, FiGift, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';

import { API_URL } from '../../utils/api';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axios.delete(`${API_URL}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p classFace="text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    {
      label: 'Active Coupons',
      value: coupons.length,
      icon: FiTag,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'Percentage Type',
      value: coupons.filter((c) => c.type === 'percentage').length,
      icon: FiPercent,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Flat Discounts',
      value: coupons.filter((c) => c.type === 'flat').length,
      icon: FiGift,
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Coupons
          </h1>
          <p className="text-gray-500 mt-1">Manage discount codes and their usage</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]">
          <FiPlus />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, gradient }) => (
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiClock className="text-amber-500" />
            <span>Latest coupons</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiShield className="text-emerald-500" />
            <span>Coupons with usage control</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Min Order</th>
                <th className="p-3 text-left">Valid Until</th>
                <th className="p-3 text-left">Usage</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-bold text-gray-900">{coupon.code}</td>
                  <td className="p-3 capitalize">{coupon.type}</td>
                  <td className="p-3">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="p-3">₹{coupon.minOrderValue}</td>
                  <td className="p-3">{coupon.validUntil ? format(new Date(coupon.validUntil), 'PP') : '—'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button className="text-cyan-600 hover:text-cyan-700 p-2 rounded-lg hover:bg-cyan-50">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </button>
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

export default AdminCoupons;


