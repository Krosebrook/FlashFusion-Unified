import axios from 'axios';
import { AppConfig, GenerationResult, Template, Platform } from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// App Generation API
export const generateApp = async (config: AppConfig): Promise<GenerationResult> => {
  try {
    const response = await apiClient.post('/generate', config);
    return response.data;
  } catch (error) {
    console.error('Failed to generate app:', error);
    throw new Error('Failed to generate application. Please try again.');
  }
};

// Templates API
export const fetchTemplates = async (): Promise<Template[]> => {
  try {
    const response = await apiClient.get('/templates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
};

export const fetchTemplatesByPlatform = async (platform: string): Promise<Template[]> => {
  try {
    const response = await apiClient.get(`/templates/${platform}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch templates for ${platform}:`, error);
    return [];
  }
};

// Platforms API
export const fetchPlatforms = async (): Promise<Platform[]> => {
  try {
    const response = await apiClient.get('/platforms');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch platforms:', error);
    return [];
  }
};

// Generation Status API
export const getGenerationStatus = async (projectId: string): Promise<GenerationResult> => {
  try {
    const response = await apiClient.get(`/status/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get generation status:', error);
    throw new Error('Failed to get generation status.');
  }
};

// Deployment API
export const deployApp = async (projectId: string, deploymentConfig: any): Promise<any> => {
  try {
    const response = await apiClient.post(`/deploy/${projectId}`, deploymentConfig);
    return response.data;
  } catch (error) {
    console.error('Failed to deploy app:', error);
    throw new Error('Failed to deploy application.');
  }
};

// Health Check API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// WebSocket connection helper
export const createWebSocketConnection = (projectId: string): WebSocket => {
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
  const ws = new WebSocket(`${wsUrl}/ws/generation/${projectId}`);
  
  ws.onopen = () => {
    console.log('WebSocket connected for project:', projectId);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected for project:', projectId);
  };
  
  return ws;
};

export default apiClient;