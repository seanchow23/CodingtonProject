import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/investment-types',
  withCredentials: true,
});

// -----------------------------
// Investment Type CRUD
// -----------------------------

// Create a new investment type
export const createInvestmentType = (data) => API.post('/', data);

// Get one investment type by ID
export const getInvestmentType = (id) => API.get(`/${id}`);

// Update an investment type
export const updateInvestmentType = (id, data) => API.put(`/${id}`, data);

// Delete an investment type
export const deleteInvestmentType = (id) => API.delete(`/${id}`);

// Get all investment types
export const getAllInvestmentTypes = () => API.get('/');
