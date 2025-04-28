import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewPortfolio.css"

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

  return (
    <div className="view-portfolio-container">
  <h2 className="view-portfolio-heading">📊 My Portfolio</h2>

  {loading && <p>Loading portfolio...</p>}
  {error && <p className="view-portfolio-error">{error}</p>}

  {!loading && portfolio.length === 0 && <p className="view-portfolio-no-data">No assets found. Add some!</p>}

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
          portfolio.map((asset) => (
            <tr key={asset._id}>
              <td>{asset.assetType}</td>
              <td>{asset.name}</td>
              <td>{asset.quantity || "-"}</td>
              <td>{asset.buyPrice || "-"}</td>
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
          ))
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

  <button onClick={() => navigate("/add-asset")} className="view-portfolio-add-button">
    ➕ Add New Asset
  </button>
</div>

  );
};

// const styles = {
//   container: {
//     maxWidth: "900px",
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
//     fontSize: "1rem",
//   },
//   tableContainer: {
//     overflowX: "auto",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     marginTop: "10px",
//   },
//   addButton: {
//     marginTop: "15px",
//     padding: "10px",
//     fontSize: "1rem",
//     cursor: "pointer",
//     backgroundColor: "#4CAF50",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//   },
//   editButton: {
//     padding: "5px 10px",
//     fontSize: "0.9rem",
//     cursor: "pointer",
//     backgroundColor: "#2196F3",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//     marginRight: "5px",
//   },
//   deleteButton: {
//     padding: "5px 10px",
//     fontSize: "0.9rem",
//     cursor: "pointer",
//     backgroundColor: "#F44336",
//     color: "white",
//     border: "none",
//     borderRadius: "5px",
//   },
// };

export default ViewPortfolio;
