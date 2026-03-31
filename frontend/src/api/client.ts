import axios from 'axios';

const TENANT_SLUG = 'abc-avm';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:15296';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1/t/${TENANT_SLUG}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
