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

export const fetchHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
