/// <reference types="node" />
import axios from 'axios';

const API_URL = 'https://witty-taxes-join.loca.lt/api';

export const generatePortfolio = async (formData: FormData) => {
  const response = await axios.post(`${API_URL}/generate`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getPortfolio = async (username: string) => {
  const response = await axios.get(`${API_URL}/portfolios/${username}`);
  return response.data;
};

export const updatePortfolio = async (username: string, data: any) => {
  const response = await axios.put(`${API_URL}/portfolios/${username}`, data);
  return response.data;
};
