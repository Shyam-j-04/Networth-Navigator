import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

const TrackNetWorth = () => {
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [netWorth, setNetWorth] = useState(0);

  const getChartData = () => [
    { name: "Stocks", value: assets.stockValue || 0 },
    { name: "Crypto", value: assets.cryptoValue || 0 },
    { name: "Mutual Funds", value: assets.mutualFundValue || 0 },
    { name: "Gold", value: assets.goldValue || 0 },
    { name: "FDs", value: assets.fdValue || 0 },
  ];

  useEffect(() => {
    const fetchNetWorth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not authenticated!");
          return;
        }

        await axios.get("http://localhost:5000/api/portfolio", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get("http://localhost:5000/api/portfolio/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNetWorth(response.data.totalNetWorth);
        setAssets(response.data);
      } catch (err) {
        setError("Failed to fetch net worth data!");
      } finally {
        setLoading(false);
      }
    };

    fetchNetWorth();

    // Commented to avoid API limit exhaustion
    // const intervalId = setInterval(fetchNetWorth, 10000);
    // return () => clearInterval(intervalId);
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

            <h3 style={{ marginTop: "30px" }}>🧩 Asset Allocation</h3>
            <div style={{ width: "100%", height: 350, paddingTop: 10 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={getChartData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
