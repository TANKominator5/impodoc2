// src/components/PatientDashboard.jsx
import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const PatientDashboard = () => {
  const { account, connected } = useWallet();
  const [doctorAddress, setDoctorAddress] = useState("");

  const handleGrantAccess = () => {
    // TODO: Hook to smart contract
    alert(`Granting access to: ${doctorAddress}`);
  };

  const handleRevokeAccess = () => {
    // TODO: Hook to smart contract
    alert(`Revoking access from: ${doctorAddress}`);
  };

  const handleCheckStatus = () => {
    // TODO: Hook to smart contract
    alert("Checking access status...");
  };

  const handleViewLogs = () => {
    // TODO: Hook to smart contract
    alert("Fetching access logs...");
  };

  const truncateHex = (hex, length = 6) => {
    if (!hex) return "";
    return `${hex.slice(0, length + 2)}...${hex.slice(-4)}`;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>👩‍⚕️ Patient Dashboard</h2>
      {connected ? (
        <>
          <p>
            <strong>Connected Wallet:</strong>{" "}
            {truncateHex(account?.address?.toString())}
          </p>

          <input
            type="text"
            placeholder="Enter Doctor's Aptos Address"
            value={doctorAddress}
            onChange={(e) => setDoctorAddress(e.target.value)}
            style={{ padding: "0.5rem", width: "100%", marginTop: "1rem" }}
          />

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={handleGrantAccess}>Grant Access</button>
            <button onClick={handleRevokeAccess}>Revoke Access</button>
          </div>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={handleCheckStatus}>Check Access Status</button>
            <button onClick={handleViewLogs}>View Access History</button>
          </div>
        </>
      ) : (
        <p>Please connect your Petra wallet to access the dashboard.</p>
      )}
    </div>
  );
};

export default PatientDashboard;