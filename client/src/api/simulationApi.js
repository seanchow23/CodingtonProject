import axios from 'axios';

const API = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: true, // needed if you're using sessions/cookies
});

export async function runSimulation(scenario, seed = null, user = null) {
  try {
    const response = await API.post('/simulation', {
      scenario,
      seed,
      user
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