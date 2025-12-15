import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryForm = ({ category, categories, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    parentCategory: category?.parentCategory?._id || category?.parentCategory || '',
    order: category?.order || 0,
    isActive: category?.isActive !== undefined ? category.isActive : true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => {
    // Only set preview if category has a valid image URL
    if (category?.image && 
        category.image.trim() && 
        category.image.length > 10 &&
        !category.image.includes('placeholder') &&
        (category.image.startsWith('http') || category.image.startsWith('data:image/'))) {
      return category.image;
    }
    return null;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset image file input
    const imageInput = document.querySelector('input[type="file"][accept="image/*"]');
    if (imageInput) imageInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      if (formData.parentCategory) {
        formDataToSend.append('parentCategory', formData.parentCategory);
      }
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (category?._id) {
        await axios.put(`${API_URL}/categories/${category._id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API_URL}/categories`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Category created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative animate-fadeIn flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-xl flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">
              {category?._id ? '✏️ Edit Category' : '➕ Add New Category'}
            </h2>
            <p className="text-primary-100 text-xs mt-0.5">
              {category?._id ? 'Update category information' : 'Create a new category'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            type="button"
            title="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form id="category-form" onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Water Purifiers"
              className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm py-2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Brief description..."
              className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none text-sm py-2"
            />
          </div>

          {/* Parent Category & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Parent Category
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleChange}
                className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm py-2"
              >
                <option value="">None</option>
                {categories.filter(cat => cat._id !== category?._id).map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-sm py-2"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 transition-colors">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FiImage className="inline mr-2" />
              Category Image
            </label>
            
            {/* Image Preview */}
            {imagePreview ? (
              <div className="mb-3 relative inline-block">
                <div className="relative group">
                  <img 
                    src={imagePreview} 
                    alt="Category preview" 
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                    onError={(e) => {
                      // Hide image on error and show placeholder
                      e.target.style.display = 'none';
                      const placeholder = e.target.parentElement.parentElement.querySelector('.no-image-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    title="Remove image"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            ) : null}
            {!imagePreview && (
              <div className="text-center py-4 bg-gray-50 rounded-lg mb-3 no-image-placeholder">
                <FiImage className="mx-auto text-2xl text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">No image</p>
              </div>
            )}

            {/* File Input */}
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-2 rounded-lg transition-colors text-sm">
                <FiUpload />
                <span className="font-medium">
                  {imagePreview ? 'Change' : 'Upload Image'}
                </span>
              </div>
            </label>
          </div>

          {/* Active Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Active Category
              </span>
            </label>
          </div>
        </form>

        {/* Footer - Fixed */}
        <div className="border-t p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="category-form"
            disabled={loading}
            className="px-5 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>{category?._id ? '💾 Update' : '✨ Create'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;

