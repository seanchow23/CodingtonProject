import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/users',
  withCredentials: true,
});

// -----------------------------
// User CRUD & Session
// -----------------------------

// Get all users (optional/admin)
export const getUsers = () => API.get('/');

// Get one user by ID
export const getUser = (id) => API.get(`/${id}`);

// Update user info
export const updateUser = (id, data) => API.put(`/${id}`, data);

// Delete user
export const deleteUser = (id) => API.delete(`/${id}`);

// Get currently logged-in user
export const getCurrentUser = () => API.get('/me');

// -----------------------------
// Scenario Management for User
// -----------------------------

// Get all scenarios associated with a user
export const getUserScenarios = (userId) => API.get(`/${userId}/scenarios`);

// Share a scenario with another user (adds to their scenario list)
export const shareScenarioWithUser = (userId, scenarioId) =>
  API.post(`/${userId}/scenarios/${scenarioId}`);
