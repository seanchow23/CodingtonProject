import React, { useEffect, useState } from 'react';

function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setUser(data));
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
