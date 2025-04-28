import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddAsset.css"

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

    // Reset FD fields if assetType is changed
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

      console.log("✅ Asset added:", response.data);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add asset!");
      console.error("❌ Error:", error.response?.data || error);
    }
  };

  return (
    <div className="container">
      <h2 className="heading">➕ Add Asset</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="form">
        <label>Asset Type:</label>
        <select name="assetType" onChange={handleChange} required className="select">
          <option value="">Select</option>
          <option value="crypto">Crypto</option>
          <option value="stock">Stock</option>
          <option value="gold">Gold</option>
          <option value="mutualfund">Mutual Fund</option>
          <option value="fixed_deposit">Fixed Deposit</option>
        </select>

        <label>Asset Name:</label>
        <input type="text" name="name" onChange={handleChange} required className="input" />

        {formData.assetType !== "fixed_deposit" && (
          <>
            <label>Quantity:</label>
            <input type="number" name="quantity" onChange={handleChange} className="input" />

            <label>Buy Price:</label>
            <input type="number" name="buyPrice" onChange={handleChange} className="input" />
          </>
        )}

        {formData.assetType === "fixed_deposit" && (
          <>
            <label>Principal Amount:</label>
            <input type="number" name="principalAmount" onChange={handleChange} className="input" required />

            <label>Interest Rate (%):</label>
            <input type="number" name="interestRate" onChange={handleChange} className="input" required />

            <label>Duration (Years):</label>
            <input type="number" name="durationInYears" onChange={handleChange} className="input" required />

            <label>Start Date:</label>
            <input type="date" name="startDate" onChange={handleChange} className="input" required />
          </>
        )}

        <button type="submit" className="button">Add Asset</button>
      </form>
    </div>
  );
};

// const styles = {
//   container: {
//     maxWidth: "500px",
//     margin: "auto",
//     padding: "20px",
//     textAlign: "center",
//   },
//   heading: {
//     fontSize: "1.8rem",
//     marginBottom: "20px",
//   },
//   error: {
//     color: "red",
//     fontSize: "0.9rem",
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   },
//   input: {
//     padding: "8px",
//     fontSize: "1rem",
//     borderRadius: "5px",
//     border: "1px solid #ccc",
//   },
//   button: {
//     marginTop: "10px",
//     padding: "10px",
//     fontSize: "1rem",
//     cursor: "pointer",
//     backgroundColor: "#4CAF50",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//   },
// };

export default AddAsset;
