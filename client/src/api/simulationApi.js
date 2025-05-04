import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // needed if you're using sessions/cookies
});

export async function runSimulation(scenario, seed = null) {
  try {
    const response = await API.post('/simulation', {
      scenario,
      seed
    });

    const data = response.data;

    if (!data.success) {
      throw new Error(data.error || 'Simulation failed');
    }

    return data.result;
  } catch (error) {
    console.error('Simulation error:', error.message);
    throw error;
  }
}