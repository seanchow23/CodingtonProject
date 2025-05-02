import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/events',
  withCredentials: true,
});

// -----------------------------
// Event CRUD
// -----------------------------

// Create a new event (base schema)
export const createEvent = (data) => API.post('/', data);

// Get one event by ID
export const getEvent = (id) => API.get(`/${id}`);

export const getEventUnpop = (id) => API.get(`/unpopulated/${id}`);

// Update an event
export const updateEvent = (id, data) => API.put(`/${id}`, data);

export const updateEventAllocations = (id, data) => API.put(`/${id}/allocations`, data);

// Delete an event
export const deleteEvent = (id) => API.delete(`/${id}`);

// Get all events
export const getAllEvents = () => API.get('/');
