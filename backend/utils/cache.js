// Simple in-memory cache for frequently accessed data
const cache = {
  categories: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
  }
};

export const getCachedCategories = () => {
  if (
    cache.categories.data &&
    cache.categories.timestamp &&
    Date.now() - cache.categories.timestamp < cache.categories.ttl
  ) {
    return cache.categories.data;
  }
  return null;
};

export const setCachedCategories = (data) => {
  cache.categories.data = data;
  cache.categories.timestamp = Date.now();
};

export const clearCategoriesCache = () => {
  cache.categories.data = null;
  cache.categories.timestamp = null;
};

