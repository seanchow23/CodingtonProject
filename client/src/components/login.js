import React, { useEffect, useState } from 'react';

function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        const text = await res.text();
        if (!text) return null;
        return JSON.parse(text);
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error('Error fetching user:', err);
        setUser(null); // ensure UI still shows login button
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
