import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PatientView from "./pages/PatientView";
import AdminView from "./pages/AdminView";
import Dashboard from "./pages/Dashboard";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/patient" element={<PatientView />} />
    <Route path="/admin" element={<AdminView />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
);

export default AppRoutes;

