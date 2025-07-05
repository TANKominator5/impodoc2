// src/pages/AdminView.jsx
import React from "react";
import AdminPanel from "../components/AdminPanel";

const AdminView = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Admin Panel</h1>
      <AdminPanel />
    </div>
  );
};

export default AdminView;