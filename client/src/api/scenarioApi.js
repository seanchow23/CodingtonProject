import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/scenarios',
  withCredentials: true,
});

// -----------------------------
// Scenario CRUD
// -----------------------------

// Create a new scenario (user is optional)
export const createScenario = async (data) => {
  console.log("DEBUG: request recieved at create scenario");
  try {
    console.log("DEBUG: sending request to the backend for create scenario");
    const response = await API.post('/', data);
    return response.data; // Return the created scenario
  } catch (error) {
    console.error('Error creating scenario:', error);
    throw error; // Rethrow the error for handling in the calling component
  }
};

// Get one scenario by ID
export const getScenario = async (id) => {
  try {
    const response = await API.get(`/${id}`);
    return response.data; // Return the fetched scenario
  } catch (error) {
    console.error('Error fetching scenario:', error);
    throw error;
  }
};

// Update a scenario
export const updateScenario = async (id, data) => {
  try {
    const response = await API.put(`/${id}`, data);
    return response.data; // Return the updated scenario
  } catch (error) {
    console.error('Error updating scenario:', error);
    throw error;
  }
};

// Delete a scenario
export const deleteScenario = async (id) => {
  try {
    const response = await API.delete(`/${id}`);
    return response.data; // Return the deletion result
  } catch (error) {
    console.error('Error deleting scenario:', error);
    throw error;
  }
};

// Get all scenarios (optional/debugging/admin)
export const getAllScenarios = async () => {
  try {
    const response = await API.get('/');
    return response.data; // Return the list of scenarios
  } catch (error) {
    console.error('Error fetching all scenarios:', error);
    throw error;
  }
};
