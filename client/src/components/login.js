import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../stylesheets/login.css';

function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/auth/user`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
        setUser(null);
      });
  }, []);

  const login = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const logout = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/logout`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {user ? (
          <>
            <h2>Welcome, {user.username}</h2>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={login}>Login with Google</button>
        )}
      </div>
    </div>
  );
  
}

export default Login;
