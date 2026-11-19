const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Health check endpoint
 */
export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}

/**
 * Admin Login
 */
export async function loginAdmin({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Login failed. Please check your credentials.');
  }

  return data;
}

/**
 * Create a new product (Admin only)
 */
export async function createProduct(productPayload, token) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productPayload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || (data.details && data.details.join(', ')) || 'Failed to create product.');
  }

  const p = data.data;
  return {
    ...p,
    id: p._id || p.id,
  };
}

/**
 * Fetch all products from MongoDB
 * If empty, automatically calls /api/products/seed to initialize defaults
 */
export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  const result = await response.json();

  return (result.data || []).map((p) => ({
    ...p,
    id: p._id || p.id,
  }));
}

/**
 * Create a new order after payment confirmation
 */
export async function createOrder(orderPayload) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data.error || (data.details && data.details.join(', ')) || 'Failed to save order to backend.';
    throw new Error(errorMsg);
  }

  const order = data.data;
  return {
    ...order,
    id: order._id || order.id,
  };
}

/**
 * Fetch all saved orders for reprint and history
 */
export async function fetchSavedOrders() {
  const response = await fetch(`${API_BASE_URL}/orders`);
  if (!response.ok) {
    throw new Error(`Failed to fetch order history: ${response.statusText}`);
  }
  const result = await response.json();
  return (result.data || []).map((ord) => ({
    ...ord,
    id: ord._id || ord.id,
  }));
}

/**
 * Fetch Admin Dashboard Sales & Order Stats (Admin only)
 */
export async function fetchAdminStats(token) {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch admin dashboard metrics.');
  }

  return data.data;
}

/**
 * Update an existing product (Admin only)
 */
export async function updateProduct(id, productPayload, token) {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productPayload),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || (data.details && data.details.join(', ')) || 'Failed to update product.');
  }

  const p = data.data;
  return {
    ...p,
    id: p._id || p.id,
  };
}

/**
 * Toggle product availability (Admin only)
 */
export async function toggleProductAvailability(id, token) {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}/toggle-availability`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to toggle product availability.');
  }

  const p = data.data;
  return {
    ...p,
    id: p._id || p.id,
  };
}

/**
 * Fetch all saved orders with optional filtering (date, status, serviceType, search)
 */
export async function fetchFilteredOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.serviceType && filters.serviceType !== 'All') params.append('serviceType', filters.serviceType);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', String(filters.limit));

  const url = `${API_BASE_URL}/orders${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.statusText}`);
  }
  const result = await response.json();
  return (result.data || []).map((ord) => ({
    ...ord,
    id: ord._id || ord.id,
  }));
}

/**
 * Fetch a specific order by orderNumber
 */
export async function fetchOrderByNumber(orderNumber) {
  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`);
  if (!response.ok) {
    throw new Error(`Order ${orderNumber} not found.`);
  }
  const result = await response.json();
  const order = result.data;
  return {
    ...order,
    id: order._id || order.id,
  };
}
