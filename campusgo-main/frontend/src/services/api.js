/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = '/api';

export const getToken = () => localStorage.getItem('eparking_token');
export const setToken = (token) => localStorage.setItem('eparking_token', token);
export const removeToken = () => {
  localStorage.removeItem('eparking_token');
  localStorage.removeItem('eparking_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('eparking_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('eparking_user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Gagal memproses respon server.',
  }));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        removeToken();
      }
    }
    throw new Error(data.message || `Terjadi kesalahan (Kode: ${response.status})`);
  }

  return data;
}

export const api = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request('/auth/me'),

  getDemoAccounts: () => request('/auth/demo-accounts'),

  getVehicles: () => request('/vehicles'),

  addVehicle: (vehicleData) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    }),

  deleteVehicle: (id) =>
    request(`/vehicles/${id}`, {
      method: 'DELETE',
    }),

  getPackages: () => request('/subscriptions/packages'),

  getSubscriptions: () => request('/subscriptions/history'),

  getActiveSubscription: () => request('/subscriptions/active'),

  purchaseSubscription: (packageId, paymentMethod) =>
    request('/subscriptions/purchase', {
      method: 'POST',
      body: JSON.stringify({ package_id: packageId, payment_method: paymentMethod }),
    }),

  verifyQR: (qrCode) =>
    request('/attendant/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qr_code: qrCode }),
    }),

  checkin: (payload) =>
    request('/attendant/checkin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCheckinLogs: () => request('/attendant/checkins'),

  getSpots: (params = {}) => {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/spots${qs}`);
  },

  getSpotById: (id) => request(`/spots/${id}`),
};
