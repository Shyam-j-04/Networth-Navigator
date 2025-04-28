import React from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css"; // Import the CSS file

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="parent">
      <div className="welcome-container">
        <h1>Welcome to Net Worth Tracker</h1>
        <p>Manage and track your assets in real time.</p>

        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </div>
  );
}

export default Welcome;
