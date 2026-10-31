import axios from 'axios';

export interface HealthResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  appName: string;
  version: string;
  timestamp: string;
  details: {
    database?: string;
    dbProductName?: string;
    dbProductVersion?: string;
    dbError?: string;
    [key: string]: unknown;
  };
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to inject JWT Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsphere_jwt');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated 401 response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('shopsphere_jwt')) {
      // Token might be expired or invalidated
      localStorage.removeItem('shopsphere_jwt');
    }
    return Promise.reject(error);
  }
);

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
