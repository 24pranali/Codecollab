import axios from 'axios';

const instance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`, // or use `${process.env.REACT_APP_API_URL}/api` in deployment
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
