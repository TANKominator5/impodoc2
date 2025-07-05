import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PatientView from "./pages/PatientView";
import AdminView from "./pages/AdminView";
import Dashboard from "./pages/Dashboard";
import MyAccount from "./pages/MyAccount";
import PatientDataUpload from "./pages/PatientDataUpload";
import VerificationForm from "./pages/VerificationForm";
import PatientDataView from "./pages/PatientDataView";
import ResearchSubmission from "./pages/ResearchSubmission";
import MyUploads from "./pages/MyUploads";
import AccessControl from "./components/AccessControl";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/patient" element={<PatientView />} />
    <Route path="/admin" element={<AdminView />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/my-account" element={<MyAccount />} />
    <Route path="/upload-patient-data" element={<PatientDataUpload />} />
    <Route path="/verification" element={<VerificationForm />} />
    <Route path="/patient-data" element={<PatientDataView />} />
    <Route path="/research-submission" element={<ResearchSubmission />} />
    <Route path="/my-uploads" element={<MyUploads />} />
    <Route path="/access-control" element={<AccessControl />} />
  </Routes>
);

export default AppRoutes;

