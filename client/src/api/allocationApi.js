import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/allocation',
  withCredentials: true,
});

export const createAllocation = (data) => API.post('/', data);
export const getAllocation = (id) => API.get(`/${id}`);
export const updateAllocation = (id, data) => API.put(`/${id}`, data);
export const deleteAllocation = (id) => API.delete(`/${id}`);
export const getAllAllocations = () => API.get('/');
