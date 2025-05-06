import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-title">Financial Planner</Link>
      <div className="navbar-buttons">
        <NavLink to="/user_profile">Profile</NavLink>
        <NavLink to="/login">Login/Logout</NavLink>
      </div>
    </nav>
  );
}

function NavLink({ to, children, ...props }) {
  const active = useMatch({path: useResolvedPath(to).pathname})

  return (<div className={active ? "active" : ""}>
    <Link className="navbar-button" to={to} {...props}>{children}</Link>
  </div>)
}