import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/scenarios',
  withCredentials: true,
});

// -----------------------------
// Scenario CRUD
// -----------------------------

// Create a new scenario (user is optional!)
export const createScenario = (data) => API.post('/', data);

// Get one scenario by ID
export const getScenario = (id) => API.get(`/${id}`);

// Update a scenario
export const updateScenario = (id, data) => API.put(`/${id}`, data);

// Delete a scenario
export const deleteScenario = (id) => API.delete(`/${id}`);

// Get all scenarios (optional/debugging/admin)
export const getAllScenarios = () => API.get('/');
