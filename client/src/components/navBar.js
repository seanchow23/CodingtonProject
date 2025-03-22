import React from "react";

const Navbar = () => {
  return (
<nav className="navbar">
  <div className="navbar-title">App Name</div>
  <div className="navbar-buttons">
    <button className="navbar-button">Scenarios</button>
    <button className="navbar-button">Simulation</button>
    <button className="navbar-button">Profile</button>
  </div>
</nav>

  );
};
export default Navbar;