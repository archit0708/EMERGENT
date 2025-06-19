// API service for Nolita Cacao Calculator
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

// Helper function for API calls
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// ==================== COST STRUCTURE API ====================
export const costStructureAPI = {
  get: () => apiCall('/api/cost-structure'),
  update: (costStructure) => apiCall('/api/cost-structure', {
    method: 'PUT',
    body: JSON.stringify(costStructure),
  }),
};

// ==================== CATEGORIES API ====================
export const categoriesAPI = {
  getAll: () => apiCall('/api/categories'),
  add: (name) => apiCall('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }),
  update: (oldName, newName) => apiCall(`/api/categories/${encodeURIComponent(oldName)}?new_name=${encodeURIComponent(newName)}`, {
    method: 'PUT',
  }),
  delete: (name) => apiCall(`/api/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  }),
};

// ==================== PRODUCTS API ====================
export const productsAPI = {
  getAll: () => apiCall('/api/products'),
  create: (product) => apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  get: (id) => apiCall(`/api/products/${id}`),
  update: (id, product) => apiCall(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  }),
  delete: (id) => apiCall(`/api/products/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== HAMPERS API ====================
export const hampersAPI = {
  getAll: () => apiCall('/api/hampers'),
  create: (hamper) => apiCall('/api/hampers', {
    method: 'POST',
    body: JSON.stringify(hamper),
  }),
  get: (id) => apiCall(`/api/hampers/${id}`),
  delete: (id) => apiCall(`/api/hampers/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== UTILITY FUNCTIONS ====================
export const initializeData = async () => {
  try {
    // Load all initial data
    const [costStructure, categories, products, hampers] = await Promise.all([
      costStructureAPI.get(),
      categoriesAPI.getAll(),
      productsAPI.getAll(),
      hampersAPI.getAll(),
    ]);
    
    return {
      costStructure,
      categories,
      products,
      hampers,
    };
  } catch (error) {
    console.error('Failed to initialize data:', error);
    // Return default values if API fails
    return {
      costStructure: {
        labourPercent: 20,
        packagingAmount: 100,
        manufacturingPercent: 20,
        marketingPercent: 20,
        deliveryAmount: 100,
        gstPercent: 18,
      },
      categories: [
        'LIQUOR CHOCOLATES', 'BON BON', 'GANACHE', 'TRUFFLES', 'STICK PALO',
        'SQUARE BAR', 'TRAVEL CAKES', 'COOKIES- SMALL CHUNK', 'SAVORY- VEGAN',
        'BROWNIE', 'DRAGEES', 'QUADRAPLETS SPREADS', 'CHOCOLATE CUBE',
        'BISCOTTI', 'CHOCOLATE FLOWER BAR'
      ],
      products: [],
      hampers: [],
    };
  }
};