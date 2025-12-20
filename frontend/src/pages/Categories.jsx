import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getTranslation } from '../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Categories = () => {
  const { language } = useSelector((state) => state.language);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {getTranslation('categories', language)}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/products?category=${category._id}`}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-primary-100 rounded-lg mb-4 flex items-center justify-center text-6xl">
                💧
              </div>
            )}
            <h3 className="font-semibold text-lg">{category.name}</h3>
            {category.description && (
              <p className="text-gray-600 text-sm mt-2">{category.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;







