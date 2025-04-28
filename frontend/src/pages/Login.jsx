import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Step 1: Initialize navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);

      const { token } = response.data;
      localStorage.setItem("token", token); // Store token in localStorage

      console.log("✅ Login successful!");
      navigate("/Dashboard"); // Step 2: Redirect to Dashboard
    } catch (error) {
      setError(error.response?.data?.message || "Login failed!");
      console.error("❌ Login error:", error.response?.data || error);
    }
  };

  return (
    <div className="login-container">
  <div className="login-card">
    <h2>Login</h2>
    {error && <p className="error">{error}</p>}
    <form onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Username:</label>
        <input type="text" name="username" onChange={handleChange} required />
      </div>

      <div className="input-group">
        <label>Email:</label>
        <input type="email" name="email" onChange={handleChange} required />
      </div>

      <div className="input-group">
        <label>Password:</label>
        <input type="password" name="password" onChange={handleChange} required />
      </div>

      <button type="submit" className="login-button">Login</button>
    </form>
  </div>
</div>

  );
};

export default Login;
