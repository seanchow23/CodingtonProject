import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/distributions`,
  withCredentials: true,
});

export const createDistribution = (data) => API.post('/', data);
export const getDistribution = (id) => API.get(`/${id}`);
export const updateDistribution = (id, data) => API.put(`/${id}`, data);
export const deleteDistribution = (id) => API.delete(`/${id}`);
export const getAllDistributions = () => API.get('/');