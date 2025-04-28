import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", formData);

      console.log("✅ Registration successful:", response.data);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed!");
      console.error("❌ Registration error:", error.response?.data || error);
    }
  };

  return (
    <div className="auth-container">
  <div className="auth-card">
    <h2>Register</h2>
    {error && <p className="error">{error}</p>}

    <form onSubmit={handleSubmit}>
    <div className="reg-input-group">
      <label>Username:</label>
      <input type="text" name="username" onChange={handleChange} required />
    </div>

    <div className="reg-input-group">
      <label>Email:</label>
      <input type="email" name="email" onChange={handleChange} required />
    </div>

    <div className="reg-input-group">
      <label>Password:</label>
      <input type="password" name="password" onChange={handleChange} required />
    </div>
      <button type="submit">Register</button>
    </form>
  </div>
</div>
  );
};

export default Register;
