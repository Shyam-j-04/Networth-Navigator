import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewPortfolio.css";

// Helper function to format asset name
const formatAssetName = (name) => {
  const formattedName = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([a-zA-Z])(\d)/g, '$1 $2').replace(/([0-9])([a-zA-Z])/g, '$1 $2');
  return formattedName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const ViewPortfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/portfolio",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPortfolio(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch portfolio!");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortfolio(portfolio.filter((asset) => asset._id !== id));
      alert("✅ Asset deleted successfully!");
    } catch (err) {
      alert("❌ Failed to delete asset!");
    }
  };

// Helper function to display quantity and buyPrice for Fixed Deposit
const formatFixedDeposit = (asset) => {
  if (asset.assetType.toLowerCase() === "fixed_deposit") {
    // Use principalAmount as the buyPrice for fixed deposits
    return { quantity: 1, buyPrice: asset.principalAmount || "Principle" };
  }
  return { quantity: asset.quantity || "-", buyPrice: asset.buyPrice || "-" };
};

const handleGoBack = () => {
  navigate("/dashboard"); // Assuming /dashboard is your dashboard route
};

  return (
    <div className="view-portfolio-container">
      <h2 className="view-portfolio-heading">📊 My Portfolio</h2>

      {loading && <p>Loading portfolio...</p>}
      {error && <p className="view-portfolio-error">{error}</p>}

      {!loading && portfolio.length === 0 && (
        <p className="view-portfolio-no-data">No assets found. Add some!</p>
      )}

      <div className="view-portfolio-table-container">
        <table className="view-portfolio-table">
          <thead>
            <tr>
              <th>Asset Type</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Buy Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.length > 0 ? (
              portfolio.map((asset) => {
                const { quantity, buyPrice } = formatFixedDeposit(asset);
                return (
                  <tr key={asset._id}>
                    <td>{formatAssetName(asset.assetType)}</td>
                    <td>{asset.name}</td>
                    <td>{quantity}</td>
                    <td>{buyPrice}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/update-asset/${asset._id}`)}
                        className="view-portfolio-edit-button"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(asset._id)}
                        className="view-portfolio-delete-button"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="view-portfolio-no-data">
                  No assets found. Add some!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate("/add-asset")}
        className="view-portfolio-add-button"
      >
        ➕ Add New Asset
      </button>

      <button type="button" onClick={handleGoBack} className="button go-back">⬅️ Go Back</button>
    </div>
  );
};

export default ViewPortfolio;
