import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ImportScenario = ({ setScenarios }) => {
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    const formData = new FormData();
    formData.append('yamlFile', file);
    
    setLoading(true);
    
    try {
      // Send the file to the backend for import
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/scenarios/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      const importedScenario = response.data;
      
      // Add the imported scenario to the list of scenarios in the app's state
      // This is what was missing before - we need to update the parent component's state
      if (setScenarios) {
        setScenarios(prevScenarios => [...prevScenarios, importedScenario]);
      }
      
      // Save to local storage if user is not logged in
      try {
        const user = await axios.get(`${process.env.REACT_APP_API_URL}/auth/user`, { 
          withCredentials: true 
        });
        
        if (!user.data) {
          const localScenarios = JSON.parse(localStorage.getItem("localScenarios")) || [];
          localScenarios.push(importedScenario);
          localStorage.setItem("localScenarios", JSON.stringify(localScenarios));
        }
      } catch (err) {
        // User not logged in, save to localStorage
        const localScenarios = JSON.parse(localStorage.getItem("localScenarios")) || [];
        localScenarios.push(importedScenario);
        localStorage.setItem("localScenarios", JSON.stringify(localScenarios));
      }
      
      // Navigate to the new scenario with the proper state
      navigate(`/scenario/${importedScenario._id}`, { 
        state: { scenario: importedScenario } 
      });
      
    } catch (err) {
      console.error('Error importing scenario:', err);
      setError(err.response?.data?.error || 'Failed to import scenario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-scenario">
      <h2>Import Scenario</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-input">
          <label htmlFor="yamlFile">Select YAML file:</label>
          <input
            type="file"
            id="yamlFile"
            accept=".yaml,.yml"
            onChange={handleFileChange}
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading || !file}>
          {loading ? 'Importing...' : 'Import Scenario'}
        </button>
      </form>
    </div>
  );
};

export default ImportScenario;