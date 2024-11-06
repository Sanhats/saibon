import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const bonsaiApi = {
  // Get all bonsais for a user
  getUserBonsais: async (userId) => {
    const response = await axios.get(`${API_URL}/bonsai/user/${userId}`);
    return response.data;
  },

  // Get a specific bonsai
  getBonsai: async (id) => {
    const response = await axios.get(`${API_URL}/bonsai/${id}`);
    return response.data;
  },

  // Create a new bonsai
  createBonsai: async (bonsaiData) => {
    const response = await axios.post(`${API_URL}/bonsai`, bonsaiData);
    return response.data;
  },

  // Update a bonsai
  updateBonsai: async (id, updates) => {
    const response = await axios.patch(`${API_URL}/bonsai/${id}`, updates);
    return response.data;
  },

  // Water the bonsai
  waterBonsai: async (id) => {
    const response = await axios.post(`${API_URL}/bonsai/${id}/water`);
    return response.data;
  }
};