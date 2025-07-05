import React from "react";
import { useNavigate } from "react-router-dom";
import "./WalletModal.css";
import WalletConnect from "./WalletConnect";
import petraLogo from "../assets/petra-logo.png";

const WalletModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleConnectSuccess = () => {
    navigate("/dashboard");
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        background: "rgba(245, 246, 250, 0.85)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 32px 0 rgba(80,80,120,0.10)",
          padding: "2.2rem 2.2rem 1.7rem 2.2rem",
          maxWidth: 370,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.2rem",
            width: "100%",
          }}
        >
          <img
            src={petraLogo}
            alt="Petra Wallet Logo"
            style={{
              marginTop: "0.5rem",
              width: "80px",
              borderRadius: "14px",
              boxShadow: "0 2px 12px 0 rgba(80,80,120,0.10)",
              opacity: 1,
              background: "#fff",
              padding: "0.5rem",
              border: "1.5px solid #e0e7ef",
            }}
          />
          <h2
            style={{
              fontWeight: 800,
              fontSize: "1.45rem",
              letterSpacing: "0.01em",
              color: "#3730a3",
              margin: 0,
              textAlign: "center",
              background: "linear-gradient(90deg, #6366f1 30%, #0ea5e9 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connect Your Petra Wallet
          </h2>
          <p
            style={{
              color: "#444",
              fontSize: "1.04rem",
              margin: 0,
              marginBottom: "0.2rem",
              textAlign: "center",
              maxWidth: 320,
              background: "rgba(245,246,250,0.7)",
              borderRadius: "7px",
              padding: "0.4em 0.7em",
            }}
          >
            Securely connect your Aptos Petra wallet to access your dashboard and manage your clinical data.
          </p>
          <div style={{ width: "100%", margin: "0.7rem 0" }}>
            <WalletConnect onConnectSuccess={handleConnectSuccess} />
          </div>
          <button
            className="close-btn"
            style={{
              marginTop: "1.2rem",
              background: "#f1f5fd",
              color: "#3730a3",
              fontWeight: 600,
              border: "1.5px solid #e0e7ef",
              borderRadius: "8px",
              padding: "0.5em 1.5em",
              cursor: "pointer",
              fontSize: "1.05rem",
              boxShadow: "0 1px 6px 0 rgba(80,80,120,0.06)",
              transition: "background 0.16s, color 0.16s, border 0.16s",
            }}
            onClick={onClose}
            onMouseDown={e => e.currentTarget.style.background = "#e0e7ef"}
            onMouseUp={e => e.currentTarget.style.background = "#f1f5fd"}
            onMouseLeave={e => e.currentTarget.style.background = "#f1f5fd"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;