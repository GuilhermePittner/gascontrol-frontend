import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/LoginComponent/index.jsx";
import Dashboard from "./components/DashboardComponent/index.jsx";
import Gasometers from "./components/GasometersComponent/index.jsx";
import Leituras from "./components/ReadingsComponent/index.jsx";
import ProtectedRoute from "./components/ProtectionComponent/index.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* login - unprotected */}
      <Route path="/" element={<Login />} />

      {/* protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/gasometers" element={<Gasometers />} />
        <Route path="/readings" element={<Leituras />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
