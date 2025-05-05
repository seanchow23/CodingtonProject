import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/expense`,
  withCredentials: true,
});

export const createExpense = (data) => API.post('/', data);
export const getExpense = (id) => API.get(`/${id}`);
export const updateExpense = (id, data) => API.put(`/${id}`, data);
export const deleteExpense = (id) => API.delete(`/${id}`);
export const getAllExpenses = () => API.get('/');
