import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/investments',
  withCredentials: true,
});

// -----------------------------
// Investment CRUD
// -----------------------------

// Create a new investment
export const createInvestment = (data) => API.post('/', data);

// Get one investment by ID
export const getInvestment = (id) => API.get(`/${id}`);

// Update an investment
export const updateInvestment = (id, data) => API.put(`/${id}`, data);

// Delete an investment
export const deleteInvestment = (id) => API.delete(`/${id}`);

// Get all investments (optional/debugging)
export const getAllInvestments = () => API.get('/');
