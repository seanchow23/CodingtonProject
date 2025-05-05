import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/invest`,
  withCredentials: true,
});

export const createInvest = (data) => API.post('/', data);
export const getInvest = (id) => API.get(`/${id}`);
export const updateInvest = (id, data) => API.put(`/${id}`, data);
export const deleteInvest = (id) => API.delete(`/${id}`);
export const getAllInvests = () => API.get('/');
