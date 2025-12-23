import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { getTranslation } from '../utils/translations';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist } from '../store/slices/wishlistSlice';
import { FiShoppingCart, FiHeart, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { API_URL } from '../utils/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useSelector((state) => state.language);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    search: searchParams.get('search') || '',
    sort: 'newest'
  });

  // Update filters when URL params change
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    
    setFilters({
      category,
      search,
      sort,
      minPrice,
      maxPrice
    });
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category && filters.category.trim()) {
        params.append('category', filters.category.trim());
      }
      if (filters.minPrice && filters.minPrice.trim()) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice && filters.maxPrice.trim()) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.search && filters.search.trim()) {
        params.append('search', filters.search.trim());
      }
      if (filters.sort) {
        params.append('sort', filters.sort);
      }

      const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('=== PRODUCTS FETCH DEBUG ===');
      console.log('Fetching products from:', url);
      console.log('Current filters:', filters);
      console.log('Category filter:', filters.category);
      
      const { data } = await axios.get(url);
      console.log('API Response:', {
        success: data.success,
        productsCount: data.products?.length || 0,
        total: data.pagination?.total || 0,
        firstProduct: data.products?.[0] ? {
          id: data.products[0]._id,
          name: data.products[0].name,
          category: data.products[0].category
        } : null
      });
      
      setProducts(data.products || []);
      
      // Log for debugging
      if (filters.category && (!data.products || data.products.length === 0)) {
        console.warn('⚠️ No products found for category:', filters.category);
        console.log('Full API Response:', data);
        console.log('Total products in response:', data.pagination?.total || 0);
        
        // Try fetching all products to see if any exist
        try {
          const allData = await axios.get(`${API_URL}/products?limit=5`);
          console.log('Sample products (first 5):', allData.data.products?.map(p => ({
            id: p._id,
            name: p.name,
            categoryId: p.category?._id || p.category,
            categoryName: p.category?.name,
            isActive: p.isActive
          })));
        } catch (err) {
          console.error('Error fetching sample products:', err);
        }
      }
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value.toString().trim()) {
      params.set(key, value.toString().trim());
    } else {
      params.delete(key);
    }
    setSearchParams(params);
    // State will be updated by the useEffect that watches searchParams
  };

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await dispatch(addToWishlist(productId)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error || 'Failed to add to wishlist');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FiFilter className="mr-2" />
              Filters
            </h3>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full input-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full input-field"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full input-field"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full input-field"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full input-field"
            />
          </div>

          {/* Products */}
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No products found</p>
              {filters.category && (
                <p className="text-gray-400 text-sm">
                  No products available in this category. Try selecting a different category.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <Link to={`/products/${product._id}`}>
                    {product.images && product.images.length > 0 && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          console.error('Product image failed to load:', product.images[0]);
                          e.target.src = '';
                          e.target.style.display = 'none';
                          if (!e.target.nextSibling) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-64 flex items-center justify-center text-6xl bg-gray-100';
                            placeholder.innerHTML = '💧';
                            e.target.parentElement.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center text-6xl bg-gray-100">
                        💧
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-primary-600">
                        {product.name}
                      </h3>
                    </Link>
                    {product.category && (
                      <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
                    )}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.mrp > product.price && (
                        <>
                          <span className="text-gray-500 line-through">
                            ₹{product.mrp.toLocaleString()}
                          </span>
                          <span className="text-green-600 text-sm font-medium">
                            {product.discountPercent}% off
                          </span>
                        </>
                      )}
                    </div>
                    {product.ratings && product.ratings.average > 0 && (
                      <div className="mb-3">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">
                          {product.ratings.average} ({product.ratings.count})
                        </span>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition flex items-center justify-center space-x-1"
                      >
                        <FiShoppingCart />
                        <span>{getTranslation('addToCart', language)}</span>
                      </button>
                      <button
                        onClick={() => handleAddToWishlist(product._id)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                      >
                        <FiHeart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

