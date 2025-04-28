import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./UpdatePortfolio.css"; 

const UpdatePortfolio = () => {
  const { id } = useParams(); // Get asset ID from URL params
  const navigate = useNavigate();
  
  const [updateFormData, setUpdateFormData] = useState({
    assetType: "",
    name: "",
    quantity: "",
    buyPrice: "",
    principalAmount: "",
    interestRate: "",
    durationInYears: "",
    startDate: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔍 Extracted ID:", id);  // Debugging the asset ID

    const fetchAsset = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(token);
        if (!token) {
          navigate("/login");
          return;
        }

        console.log(`Fetching asset with ID: ${id}`);


        const response = await axios.get(`http://localhost:5000/api/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        console.log("✅ Fetched Data:", response.data);  // Debugging the response

        if (!response.data) {
          setError("❌ Asset not found!");
          return;
        }

        setUpdateFormData({
          assetType: response.data.assetType || "",
          name: response.data.name || "",
          quantity: response.data.quantity || "",
          buyPrice: response.data.buyPrice || "",
          principalAmount: response.data.principalAmount || "",
          interestRate: response.data.interestRate || "",
          durationInYears: response.data.durationInYears || "",
          startDate: response.data.startDate ? response.data.startDate.split("T")[0] : "",
        });

      } catch (err) {
        console.error("❌ Fetch Error:", err.response?.data || err.message);  // Debugging
        setError(err.response?.data?.message || "Failed to fetch asset details!");
      } finally {
        setLoading(false);
      }
    };

    if (id) {  // Ensure id is not undefined before calling API
      fetchAsset();
    } else {
      console.error("❌ Invalid ID passed!");
      setError("Invalid asset ID!");
    }
  }, [id, navigate]);

  // ✅ FIXED: handleChange now correctly updates the state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ✅ FIXED: handleSubmit now correctly uses updateFormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/portfolio/${id}`, updateFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Asset updated successfully!");
      navigate("/portfolio"); // Redirect to portfolio page after update
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update asset!");
    }
  };

  return (
    <div className="update-asset-container">
      <h2 className="update-asset-heading">✏️ Update Asset</h2>

      {loading && <p className="update-asset-loading">Loading asset details...</p>}
      {error && <p className="update-asset-error">{error}</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="update-asset-form">
          {/* Displaying the Asset Type and Name */}
          <div className="update-asset-readonly-group">
            <label className="update-asset-label">Asset Type:</label>
            <p className="update-asset-readonly">{updateFormData.assetType}</p> {/* Read-only display */}
          </div>

          <div className="update-asset-readonly-group">
            <label className="update-asset-label">Asset Name:</label>
            <p className="update-asset-readonly">{updateFormData.name}</p> {/* Read-only display */}
          </div>

          {updateFormData.assetType !== "fixed_deposit" && (
            <div className="update-asset-group">
              <label className="update-asset-label">Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={updateFormData.quantity}
                onChange={handleChange}
                className="update-asset-input"
              />

              <label className="update-asset-label">Buy Price:</label>
              <input
                type="number"
                name="buyPrice"
                value={updateFormData.buyPrice}
                onChange={handleChange}
                className="update-asset-input"
              />
            </div>
          )}

          {updateFormData.assetType === "fixed_deposit" && (
            <>
              <label className="update-asset-label">Principal Amount:</label>
              <input
                type="number"
                name="principalAmount"
                value={updateFormData.principalAmount}
                onChange={handleChange}
                className="update-asset-input"
              />

              <label className="update-asset-label">Interest Rate (%):</label>
              <input
                type="number"
                name="interestRate"
                value={updateFormData.interestRate}
                onChange={handleChange}
                className="update-asset-input"
              />

              <label className="update-asset-label">Duration (Years):</label>
              <input
                type="number"
                name="durationInYears"
                value={updateFormData.durationInYears}
                onChange={handleChange}
                className="update-asset-input"
              />

              <label className="update-asset-label">Start Date:</label>
              <input
                type="date"
                name="startDate"
                value={updateFormData.startDate}
                onChange={handleChange}
                className="update-asset-input"
              />
            </>
          )}

          <button type="submit" className="update-asset-button">Save Changes</button>
        </form>
      )}
    </div>
  );
};

export default UpdatePortfolio;
