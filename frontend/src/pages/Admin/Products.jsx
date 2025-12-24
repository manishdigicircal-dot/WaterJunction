import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiBox, FiTag, FiTrendingUp, FiEye } from 'react-icons/fi';
import ProductForm from './ProductForm';
import { API_URL } from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products?withImages=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const summary = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const inactive = total - active;
    const lowStock = products.filter((p) => (p.stock || 0) < 5).length;
    return [
      { label: 'Total Products', value: total, icon: FiBox, gradient: 'from-cyan-500 to-blue-600' },
      { label: 'Active', value: active, icon: FiTrendingUp, gradient: 'from-emerald-500 to-teal-600' },
      { label: 'Inactive', value: inactive, icon: FiTag, gradient: 'from-amber-500 to-orange-500' },
      { label: 'Low Stock (<5)', value: lowStock, icon: FiEye, gradient: 'from-red-500 to-rose-500' }
    ];
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-gray-500 mt-1">Manage catalog, inventory, and product status</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-transform hover:scale-[1.02]"
        >
          <FiPlus />
          <span>Add Product</span>
        </button>
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

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <FiBox className="text-cyan-600" />
            <span>All Products</span>
          </div>
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="text-emerald-500" />
            <span>Inventory & status</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Admin product image failed:', product.images[0]);
                              e.target.style.display = 'none';
                              if (!e.target.parentElement.querySelector('.img-placeholder')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'img-placeholder w-full h-full flex items-center justify-center text-xl bg-gray-200';
                                placeholder.innerHTML = '💧';
                                e.target.parentElement.appendChild(placeholder);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-gray-200">
                            💧
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">SKU: {product._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{product.category?.name || 'N/A'}</td>
                  <td className="p-3 font-bold text-gray-900">₹{product.price?.toLocaleString()}</td>
                  <td className="p-3">{product.stock || 0}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full border text-xs font-semibold ${
                        product.isActive
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-cyan-600 hover:text-cyan-700 p-2 rounded-lg hover:bg-cyan-50"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                        title="Delete"
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

export default AdminProducts;

