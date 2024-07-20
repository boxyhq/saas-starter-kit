// src/config/apiEndpoints.js
const API_BASE_URL = 'http://localhost:8000';

const apiEndpoints = {
  users: {
    getAll: `${API_BASE_URL}/users`,
    getById: (id) => `${API_BASE_URL}/users/${id}`,
    create: `${API_BASE_URL}/users`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },
  posts: {
    getAll: `${API_BASE_URL}/posts`,
    getById: (id) => `${API_BASE_URL}/posts/${id}`,
    create: `${API_BASE_URL}/posts`,
    update: (id) => `${API_BASE_URL}/posts/${id}`,
    delete: (id) => `${API_BASE_URL}/posts/${id}`,
  },
  // Add other endpoints as needed
};

export default apiEndpoints;