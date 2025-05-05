// UserProfile.js
import React, { useState } from 'react';

import '../stylesheets/user_profile.css';
import { FaDownload, FaTrash } from 'react-icons/fa';
// we generated the following code using chatgpt. We fed our wireframe for figma and prompted gpt "how can we make a similar html layout"
export default function UserProfile() {
  const [message, setMessage] = useState('');
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("❌ No file selected.");
      setMessage("No file selected");
      return;
    }
  
    const formData = new FormData();
    formData.append('yamlFile', file);
  
    try {
      console.log("📤 Uploading file:", file.name);
  
      const res = await fetch('http://localhost:5000/api/tax/upload-state-yaml', {
        method: 'POST',
        body: formData,
      });
  
      console.log("📥 Received response:", res.status, res.statusText);
  
      const contentType = res.headers.get('content-type');
      console.log("📄 Content-Type of response:", contentType);
  
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("❗ Received non-JSON response:", text.substring(0, 300));
        throw new Error("Received non-JSON error page");
      }
  
      const data = await res.json();
      console.log("✅ Response JSON:", data);
  
      setMessage(data.message || "Upload successful");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setMessage("Upload failed: " + (err.message || "Unknown error"));
    }
  };
  



  return (
    <div className="user-profile-container">
      <section className="card user-info">
        <h2>User Profile</h2>
        <div className="user-info-content">
          <img className="user-avatar" src="/avatar_placeholder.svg" alt="User" />
          <div className="user-fields">
            <input placeholder="First Name" />
            <input placeholder="Lasgt Name" />
            <input placeholder="Email" />
            <input placeholder="Phone" />
          </div>
        </div>

       
        <p className="change-photo">Change Photo</p>
      </section>

      <section className="card sharing">
        <h2>Scenario Sharing</h2>
        <div className="sharing-entry">
          <img src="/avatar_placeholder.svg" alt="Advisor" className="sharing-avatar" />
          <div>
            <p className="role">Financial Advisor</p>
            <p className="email">advisor@example.com</p>
          </div>
          <select>
            <option>Read-only</option>
            <option>Edit</option>
          </select>
        </div>
        <p className="invite-member">+ Invite New Member</p>
      </section>

      <section className="card yaml-upload">
        <h2>Upload State Tax YAML File</h2>
        <input type="file" accept=".yaml,.yml" onChange={handleFileUpload} />
        {message && <p>{message}</p>}
      </section>


      <section className="card tax-settings">
        <h2>Tax Settings</h2>
        <div className="tax-fields">
          <div>
            <label>Tax Filing Status</label>
            <select>
              <option>Single</option>
              <option>Married Filing Jointly</option>
              <option>Head of Household</option>
            </select>
          </div>
          <div>
            <label>State of Residence</label>
            <select>
              <option>California</option>
              <option>New York</option>
              <option>Texas</option>
              <option>Other</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}


