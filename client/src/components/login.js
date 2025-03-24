import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/auth/user', { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
        setUser(null);
      });
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const logout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  return (
    <div>
      {user ? (
        <>
          <h2>Welcome, {user.displayName}</h2>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}

export default Login;
