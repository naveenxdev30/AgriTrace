const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('agritrace_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth API
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
    getDemoCredentials: async () => {
      const res = await fetch(`${API_BASE}/auth/demo-credentials`);
      return handleResponse(res);
    },
  },

  // Farmers API
  farmers: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/farmers${query ? `?${query}` : ''}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/farmers/${id}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/farmers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/farmers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/farmers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Products API
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Shipments API
  shipments: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/shipments${query ? `?${query}` : ''}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/shipments/${id}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/shipments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    updateStatus: async (id, data) => {
      const res = await fetch(`${API_BASE}/shipments/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id, data) => {
      const res = await fetch(`${API_BASE}/shipments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/shipments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Traceability API
  trace: {
    getByBatchId: async (batchId) => {
      const res = await fetch(`${API_BASE}/trace/${encodeURIComponent(batchId)}`);
      return handleResponse(res);
    },
    getRecentBatches: async () => {
      const res = await fetch(`${API_BASE}/trace`);
      return handleResponse(res);
    },
  },

  // Dashboard Stats API
  stats: {
    getDashboard: async () => {
      const res = await fetch(`${API_BASE}/stats/dashboard`);
      return handleResponse(res);
    },
  },
};
