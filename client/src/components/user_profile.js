import React, { useEffect, useState } from 'react';
import '../stylesheets/user_profile.css';
import { getCurrentUser } from '../api/userApi';

export default function UserProfile() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tax/upload-state-yaml`, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error("❗ Received non-JSON response:", text.substring(0, 300));
        throw new Error("Received non-JSON error page");
      }

      const data = await res.json();
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
            <p><strong>Username:</strong> {user?.username || "Loading..."}</p>
            <p><strong>Email:</strong> {user?.email || "Loading..."}</p>
          </div>
        </div>
      </section>

      <section className="card yaml-upload">
        <h2>Upload State Tax YAML File</h2>
        <input type="file" accept=".yaml,.yml" onChange={handleFileUpload} />
        {message && <p>{message}</p>}
      </section>
    </div>
  );
}
