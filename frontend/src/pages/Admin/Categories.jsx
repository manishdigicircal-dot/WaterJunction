import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiFolder, FiImage, FiTrendingUp, FiBox } from 'react-icons/fi';
import CategoryForm from './CategoryForm';
import { API_URL } from '../../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleFormSuccess = () => {
    fetchCategories();
  };

  const summary = useMemo(() => {
    const total = categories.length;
    const withImage = categories.filter(
      (c) =>
        c.image &&
        c.image.trim().length > 10 &&
        !c.image.includes('placeholder') &&
        (c.image.startsWith('http') || c.image.startsWith('data:image/') || c.image.startsWith('data:video/'))
    ).length;
    return [
      { label: 'Total Categories', value: total, icon: FiFolder, gradient: 'from-cyan-500 to-blue-600' },
      { label: 'With Images', value: withImage, icon: FiImage, gradient: 'from-emerald-500 to-teal-600' },
      { label: 'Without Images', value: total - withImage, icon: FiBox, gradient: 'from-amber-500 to-orange-500' }
    ];
  }, [categories]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-500 mt-1">Organize products with rich media and details</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
        >
          <FiPlus />
          <span>Add Category</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {showForm && (
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const hasValidImage =
            category.image &&
            category.image.trim() &&
            category.image.length > 10 &&
            !category.image.includes('placeholder') &&
            (category.image.startsWith('http') ||
              category.image.startsWith('data:image/') ||
              category.image.startsWith('data:video/'));

          return (
            <div
              key={category._id}
              className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {hasValidImage ? (
                <div className="w-full h-44 rounded-xl mb-4 overflow-hidden bg-gray-100 relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <div
                    className="image-placeholder w-full h-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl flex items-center justify-center text-4xl absolute inset-0"
                    style={{ display: 'none' }}
                  >
                    💧
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl mb-4 flex items-center justify-center text-4xl">
                  💧
                </div>
              )}
              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description || 'No description'}</p>
              <div className="mt-auto flex items-center justify-between space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-cyan-50 text-cyan-700 font-semibold hover:bg-cyan-100 transition-colors"
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-50 text-red-700 font-semibold hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCategories;

