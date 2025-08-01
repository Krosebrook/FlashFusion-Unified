import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const generateApp = async (config: any) => {
  const response = await axios.post(`${API_BASE}/generate`, config);
  return response.data;
};

export const fetchTemplates = async () => {
  const response = await axios.get(`${API_BASE}/templates`);
  return response.data;
};