import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PatientView from "./pages/PatientView";
import AdminView from "./pages/AdminView";
import Dashboard from "./pages/Dashboard";
import MyAccount from "./pages/MyAccount";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/patient" element={<PatientView />} />
    <Route path="/admin" element={<AdminView />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/my-account" element={<MyAccount />} />
  </Routes>
);

export default AppRoutes;

