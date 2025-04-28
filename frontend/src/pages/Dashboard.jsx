import { useNavigate } from "react-router-dom";
import "./Dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear authentication token
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
  <h1 className="dashboard-heading">📊 Dashboard</h1>

  {/* Card Buttons */}
  <div className="card-container">
    <div className="card" onClick={() => navigate("/add-asset")}>
      ➕ Add Asset
    </div>
    <div className="card" onClick={() => navigate("/portfolio")}>
      📜 View Portfolio
    </div>
    <div className="card" onClick={() => navigate("/networth")}>
      📊 Track Net Worth
    </div>
  </div>

  {/* Logout Button */}
  <button onClick={handleLogout} className="logout-button">
    Logout
  </button>
</div>

  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  cardContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap", // Prevents overflow if screen size is small
  },
  card: {
    width: "200px",
    height: "100px",
    backgroundColor: "#f4f4f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: "bold",
    transition: "0.3s",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
  },
  logoutButton: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};

export default Dashboard;
