import { useState, useEffect } from "react";
import axios from "axios";

const TrackNetWorth = () => {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated!");
          console.log("No token found");
          return;
        }
    
        console.log("Sending request with token:", token);  // Log the token being sent
        const response = await axios.get("http://localhost:5000/api/portfolio/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log("Response received:", response); // Log the full response
    
        setNetWorth(response.data.totalNetWorth);
        setAssets(response.data); // Store all asset details
      } catch (err) {
        setError("Failed to fetch net worth data!");
        console.error("Error during request:", err);  // Log the error
      } finally {
        setLoading(false);
      }
    };
    

    fetchNetWorth();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>📊 Track Your Net Worth</h1>

        {loading && <p style={styles.loading}>Loading net worth...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            <div style={styles.summary}>
              <h2>Total Net Worth</h2>
              <p>₹{netWorth.toLocaleString()}</p>
            </div>

            <div style={styles.assetBreakdown}>
              <p>📈 Stocks: ₹{assets.stockValue?.toLocaleString()}</p>
              <p>₿ Crypto: ₹{assets.cryptoValue?.toLocaleString()}</p>
              <p>💰 Mutual Funds: ₹{assets.mutualFundValue?.toLocaleString()}</p>
              <p>🏅 Gold: ₹{assets.goldValue?.toLocaleString()}</p>
              <p>🏦 Fixed Deposits: ₹{assets.fdValue?.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  container: {
    width: "90%",
    maxWidth: "800px",
    backgroundColor: "#1E1E1E",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(255, 255, 255, 0.2)",
    textAlign: "center",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  loading: {
    fontSize: "1.2rem",
    color: "#FFA500",
  },
  error: {
    color: "#FF4444",
    fontSize: "1.1rem",
  },
  summary: {
    backgroundColor: "#282828",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "1.5rem",
  },
  assetBreakdown: {
    backgroundColor: "#1E1E1E",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "1.2rem",
    textAlign: "left",
  },
};

export default TrackNetWorth;
