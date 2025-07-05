// src/pages/PatientView.jsx
import React from "react";
import PatientDashboard from "../components/PatientDashboard";

const PatientView = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Patient Dashboard</h1>
      <PatientDashboard />
    </div>
  );
};

export default PatientView;