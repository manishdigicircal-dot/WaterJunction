import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiTrash2, FiImage, FiVideo, FiPlus } from 'react-icons/fi';
import { API_URL } from '../../utils/api';

const ProductForm = ({ product, categories, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [addingSpec, setAddingSpec] = useState(null); // Track which section is adding a field
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  
  // Helper to convert Map or object to plain object
  const mapToObject = (mapOrObj) => {
    if (!mapOrObj) return {};
    if (mapOrObj instanceof Map) {
      return Object.fromEntries(mapOrObj);
    }
    return mapOrObj;
  };

  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category?._id || product?.category || '',
    description: product?.description || '',
    price: product?.price || 0,
    mrp: product?.mrp || 0,
    stock: product?.stock || 0,
    isActive: product?.isActive !== undefined ? product.isActive : true,
    isFeatured: product?.isFeatured || false,
    images: product?.images || [],
    video: product?.video || '',
    specifications: {
      performanceFeatures: mapToObject(product?.specifications?.performanceFeatures) || {},
      warranty: mapToObject(product?.specifications?.warranty) || {},
      general: mapToObject(product?.specifications?.general) || {},
      dimensions: mapToObject(product?.specifications?.dimensions) || {}
    }
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    if (product?.images) {
      setExistingImages(product.images);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('spec.')) {
      const [_, section, key] = name.split('.');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [section]: {
            ...prev.specifications[section],
            [key]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    e.target.value = ''; // Reset input
  };

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // Clear video URL when file is selected
      setFormData(prev => ({
        ...prev,
        video: ''
      }));
    }
    e.target.value = ''; // Reset input
  };

  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      video: url
    }));
    // Clear video file when URL is entered
    if (url && videoFile) {
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Prepare specifications - remove empty sections
      const cleanedSpecs = {};
      Object.entries(formData.specifications).forEach(([section, values]) => {
        if (values && Object.keys(values).length > 0) {
          cleanedSpecs[section] = values;
        }
      });

      // Video handling: If video file is uploaded, don't send video URL (file will be uploaded).
      // Otherwise, send the video URL from form (can be empty string to clear video).
      const videoToSend = videoFile ? '' : (formData.video?.trim() || '');
      
      console.log('Video to send:', videoToSend ? `URL: ${videoToSend.substring(0, 50)}...` : 'No video', videoFile ? 'File uploaded' : 'No file');
      
      formDataToSend.append('product', JSON.stringify({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        mrp: formData.mrp,
        stock: formData.stock,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        video: videoToSend, // Empty string if file uploaded, otherwise video URL
        images: existingImages, // Keep existing images
        specifications: cleanedSpecs
      }));

      // Add new images
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Add video if new
      if (videoFile) {
        formDataToSend.append('video', videoFile);
      }

      if (product?._id) {
        // Update
        await axios.put(`${API_URL}/products/${product._id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product updated successfully');
      } else {
        // Create
        await axios.post(`${API_URL}/products`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product created successfully');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to save product';
      toast.error(errorMessage);
      
      // Log more details for debugging
      if (error.response?.status === 500) {
        console.error('Server error details:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeSpecField = (section, key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[section][key];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  const startAddingSpec = (section) => {
    setAddingSpec(section);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const cancelAddingSpec = () => {
    setAddingSpec(null);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const saveSpecField = (section) => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [section]: {
            ...prev.specifications[section],
            [newSpecKey.trim()]: newSpecValue.trim()
          }
        }
      }));
      cancelAddingSpec();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-4 mb-8 relative max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-white z-10 rounded-t-2xl flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            {product?._id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-gray-100 rounded-lg transition"
            type="button"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
              placeholder="Enter product description"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">MRP (₹) *</label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                placeholder="0.00"
              />
              {formData.mrp > formData.price && (
                <p className="text-xs text-green-600 mt-1">
                  Discount: {Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)}%
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
                placeholder="0"
              />
            </div>
          </div>

          {/* Multiple Images Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FiImage className="text-xl text-cyan-600" />
              Product Images (Multiple) *
            </label>
            
            {/* Upload Button */}
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
              <FiUpload />
              <span>Add Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Existing Images ({existingImages.length}):</p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img} 
                        alt={`Product ${idx + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Files Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">New Images ({imageFiles.length}):</p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${idx + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border-2 border-cyan-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(existingImages.length === 0 && imageFiles.length === 0) && (
              <p className="text-xs text-gray-500 mt-2">No images selected. Please add at least one image.</p>
            )}
          </div>

          {/* Video Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FiVideo className="text-xl text-cyan-600" />
              Product Video (Optional)
            </label>
            
            <div className="space-y-3">
              {/* Video URL Input */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Video URL (YouTube, Vimeo, or direct link)</label>
                <div className="relative">
                  <input
                    type="url"
                    name="video"
                    value={formData.video || ''}
                    onChange={handleVideoUrlChange}
                    placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                    className="w-full px-4 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!!videoFile}
                  />
                  {formData.video && !videoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, video: '' }));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 p-1"
                      title="Clear video URL"
                    >
                      <FiX className="text-lg" />
                    </button>
                  )}
                </div>
                {formData.video && !videoFile && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Video URL entered: {formData.video.length > 50 ? formData.video.substring(0, 50) + '...' : formData.video}
                  </p>
                )}
              </div>
              
              {/* Or Upload Video File */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Or upload video file:</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
                  <FiUpload />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    disabled={!!formData.video}
                  />
                </label>
              </div>
            </div>
            
            {/* Video Preview */}
            {videoFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected Video: {videoFile.name}</p>
                <div className="relative">
                  <video 
                    src={URL.createObjectURL(videoFile)} 
                    controls 
                    className="w-full max-w-md rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition"
                  >
                    <FiTrash2 className="inline mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            {/* Existing Video */}
            {formData.video && !videoFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Current Video:</p>
                {formData.video.startsWith('http') || formData.video.startsWith('data:video/') ? (
                  <video src={formData.video} controls className="w-full max-w-md rounded-lg border-2 border-gray-200" />
                ) : (
                  <p className="text-sm text-gray-500">{formData.video}</p>
                )}
              </div>
            )}
          </div>

          {/* Status Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>

          {/* Specifications (Collapsible) */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full p-4 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition"
            >
              <span className="font-semibold text-gray-700">Specifications (Optional)</span>
              <FiPlus className={`text-xl text-gray-600 transition-transform ${showSpecs ? 'rotate-45' : ''}`} />
            </button>
            
            {showSpecs && (
              <div className="p-4 space-y-4">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Add product specifications by category. Click "Add Field" in any section, enter the field name and value, then click "Add". You can edit or remove fields anytime.
                  </p>
                </div>
                {['performanceFeatures', 'warranty', 'general', 'dimensions'].map((section) => (
                  <div key={section} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700 capitalize text-base">
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      {addingSpec !== section && (
                        <button
                          type="button"
                          onClick={() => startAddingSpec(section)}
                          className="text-cyan-600 text-sm font-medium hover:text-cyan-700 flex items-center gap-1 px-3 py-1.5 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
                        >
                          <FiPlus className="text-base" />
                          Add Field
                        </button>
                      )}
                    </div>

                    {/* Add New Field Form */}
                    {addingSpec === section && (
                      <div className="mb-4 p-3 bg-white rounded-lg border-2 border-cyan-300 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Field Name</label>
                            <input
                              type="text"
                              value={newSpecKey}
                              onChange={(e) => setNewSpecKey(e.target.value)}
                              placeholder="e.g., Capacity, Power, etc."
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Field Value</label>
                            <input
                              type="text"
                              value={newSpecValue}
                              onChange={(e) => setNewSpecValue(e.target.value)}
                              placeholder="e.g., 10L, 100W, etc."
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  saveSpecField(section);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveSpecField(section)}
                            disabled={!newSpecKey.trim() || !newSpecValue.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-md transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={cancelAddingSpec}
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Existing Fields */}
                    {Object.entries(formData.specifications[section] || {}).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(formData.specifications[section] || {}).map(([key, value]) => (
                          <div key={key} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1">{key}</div>
                              <input
                                type="text"
                                name={`spec.${section}.${key}`}
                                value={value}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none text-sm"
                                placeholder="Enter value"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSpecField(section, key)}
                              className="text-red-600 px-3 py-2 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                              title="Remove field"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No fields added yet. Click "Add Field" to add specifications.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t sticky bottom-0 bg-white pb-2 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (existingImages.length === 0 && imageFiles.length === 0)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : product?._id ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
