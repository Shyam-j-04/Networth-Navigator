import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddAsset.css";

const AddAsset = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assetType: "",
    name: "",
    quantity: "",
    buyPrice: "",
    principalAmount: "",
    interestRate: "",
    durationInYears: "",
    startDate: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "assetType" && value !== "fixed_deposit") {
      setFormData({
        ...formData,
        assetType: value,
        principalAmount: "",
        interestRate: "",
        durationInYears: "",
        startDate: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/portfolio",
        {
          assetType: formData.assetType,
          name: formData.name,
          quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
          buyPrice: formData.buyPrice ? parseFloat(formData.buyPrice) : undefined,
          principalAmount: formData.assetType === "fixed_deposit" ? parseFloat(formData.principalAmount) : undefined,
          interestRate: formData.assetType === "fixed_deposit" ? parseFloat(formData.interestRate) : undefined,
          durationInYears: formData.assetType === "fixed_deposit" ? parseInt(formData.durationInYears) : undefined,
          startDate: formData.assetType === "fixed_deposit" ? new Date(formData.startDate).toISOString() : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Asset added Successfully");
      console.log("✅ Asset added:", response.data);

      // 🧹 Clear the form after successful submission
      setFormData({
        assetType: "",
        name: "",
        quantity: "",
        buyPrice: "",
        principalAmount: "",
        interestRate: "",
        durationInYears: "",
        startDate: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add asset!");
      console.error("❌ Error:", error.response?.data || error);
    }
  };

  const handleGoBack = () => {
    navigate("/dashboard"); // Assuming /dashboard is your dashboard route
  };

  return (
    <div className="parent-container">
      <div className="container">
      <h2 className="heading">➕ Add Asset</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label>Asset Type:</label>
        <select name="assetType" value={formData.assetType} onChange={handleChange} required className="select">
          <option value="">Select</option>
          <option value="crypto">Crypto</option>
          <option value="stock">Stock</option>
          <option value="gold">Gold</option>
          <option value="mutualfund">Mutual Fund</option>
          <option value="fixed_deposit">Fixed Deposit</option>
        </select>

        <label>Asset Name:</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" />

        {formData.assetType !== "fixed_deposit" && (
          <>
            <label>Quantity:</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="input" />

            <label>Buy Price:</label>
            <input type="number" name="buyPrice" value={formData.buyPrice} onChange={handleChange} className="input" />
          </>
        )}

        {formData.assetType === "fixed_deposit" && (
          <>
            <label>Principal Amount:</label>
            <input type="number" name="principalAmount" value={formData.principalAmount} onChange={handleChange} className="input" required />

            <label>Interest Rate (%):</label>
            <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} className="input" required />

            <label>Duration (Years):</label>
            <input type="number" name="durationInYears" value={formData.durationInYears} onChange={handleChange} className="input" required />

            <label>Start Date:</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input" required />
          </>
        )}

        <button type="submit" className="button">Add Asset</button>
        <button type="button" onClick={handleGoBack} className="button go-back">⬅️ Go Back</button>
      </form>
    </div>
    </div>
    
  );
};

export default AddAsset;
