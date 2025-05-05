import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/allocation`,
  withCredentials: true,
});

export const createAllocation = (data) => API.post('/', data);
export const getAllocation = (id) => API.get(`/${id}`);
export const updateAllocation = (id, data) => API.put(`/${id}`, data);
export const deleteAllocation = (id) => API.delete(`/${id}`);
export const getAllAllocations = () => API.get('/');
