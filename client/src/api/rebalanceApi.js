import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/rebalance`,
  withCredentials: true,
});

export const createRebalance = (data) => API.post('/', data);
export const getRebalance = (id) => API.get(`/${id}`);
export const updateRebalance = (id, data) => API.put(`/${id}`, data);
export const deleteRebalance = (id) => API.delete(`/${id}`);
export const getAllRebalances = () => API.get('/');
