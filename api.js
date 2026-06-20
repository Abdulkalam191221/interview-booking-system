import axios from 'axios';

// Create a centralized axios instance configured to your Node backend URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor: Automatically inject the JWT token into the headers of every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;