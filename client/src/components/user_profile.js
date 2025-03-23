// UserProfile.js
import React from 'react';
import '../stylesheets/user_profile.css';
import { FaDownload, FaTrash } from 'react-icons/fa';

export default function UserProfile() {
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

      <section className="card yaml-files">
        <h2>Saved YAML Files</h2>
        <div className="yaml-entry">
          <p>retirement_plan_2025.yaml</p>
          <div className="yaml-actions">
            <FaDownload />
            <FaTrash />
          </div>
        </div>
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
