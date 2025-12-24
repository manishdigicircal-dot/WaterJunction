// Simple in-memory cache for frequently accessed data
const cache = {
  categories: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  adminStats: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes - admin stats don't need to be real-time
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

// PERFORMANCE: Admin stats caching - stats don't need to be real-time
export const getCachedAdminStats = () => {
  if (
    cache.adminStats.data &&
    cache.adminStats.timestamp &&
    Date.now() - cache.adminStats.timestamp < cache.adminStats.ttl
  ) {
    return cache.adminStats.data;
  }
  return null;
};

export const setCachedAdminStats = (data) => {
  cache.adminStats.data = data;
  cache.adminStats.timestamp = Date.now();
};

export const clearAdminStatsCache = () => {
  cache.adminStats.data = null;
  cache.adminStats.timestamp = null;
};


  categories: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  adminStats: {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes - admin stats don't need to be real-time
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

// PERFORMANCE: Admin stats caching - stats don't need to be real-time
export const getCachedAdminStats = () => {
  if (
    cache.adminStats.data &&
    cache.adminStats.timestamp &&
    Date.now() - cache.adminStats.timestamp < cache.adminStats.ttl
  ) {
    return cache.adminStats.data;
  }
  return null;
};

export const setCachedAdminStats = (data) => {
  cache.adminStats.data = data;
  cache.adminStats.timestamp = Date.now();
};

export const clearAdminStatsCache = () => {
  cache.adminStats.data = null;
  cache.adminStats.timestamp = null;
};

