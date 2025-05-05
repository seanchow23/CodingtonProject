import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/income`,
  withCredentials: true,
});

export const createIncome = (data) => API.post('/', data);
export const getIncome = (id) => API.get(`/${id}`);
export const updateIncome = (id, data) => API.put(`/${id}`, data);
export const deleteIncome = (id) => API.delete(`/${id}`);
export const getAllIncomes = () => API.get('/');
