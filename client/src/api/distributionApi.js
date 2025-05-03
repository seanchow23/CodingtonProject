import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/distributions',
  withCredentials: true,
});

export const createDistribution = (data) => API.post('/', data);
export const getDistribution = (id) => API.get(`/${id}`);
export const updateDistribution = (id, data) => API.put(`/${id}`, data);
export const deleteDistribution = (id) => API.delete(`/${id}`);
export const getAllDistributions = () => API.get('/');