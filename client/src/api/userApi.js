import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/users',
  withCredentials: true
});

// Get all users (optional/admin)
export const getUsers = () => API.get('/');

// Get one user by ID
export const getUser = (id) => API.get(`/${id}`);

// Update user info
export const updateUser = (id, data) => API.put(`/${id}`, data);

// Delete user
export const deleteUser = (id) => API.delete(`/${id}`);

//  Get currently logged-in user
export const getCurrentUser = () => API.get('/me');
