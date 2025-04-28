import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddAsset from "./pages/AddAsset";
import ViewPortfolio from "./pages/ViewPortfolio";
import UpdatePortfolio from "./pages/UpdatePortfolio";
import TrackNetWorth from "./pages/TrackNetWorth";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-asset" element={<AddAsset />} />
        <Route path="/portfolio" element={<ViewPortfolio />} />
        <Route path="/update-asset/:id" element={<UpdatePortfolio />} />
        <Route path="/networth" element={<TrackNetWorth />} />
      </Routes>
    </Router>
  );
}

export default App;
