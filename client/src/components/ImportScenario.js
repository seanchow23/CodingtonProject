import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ImportScenario = () => {
  
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
      // The URL was incorrect - fix it to point to your backend server
      const response = await axios.post(
        'http://localhost:5000/api/scenarios/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      // Navigate to the new scenario
      navigate(`/scenario/${response.data._id}`, { state: { scenario: response.data } });
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