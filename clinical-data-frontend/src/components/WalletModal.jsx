import React from "react";
import { useNavigate } from "react-router-dom";
import "./WalletModal.css";
import WalletConnect from "./WalletConnect";
import petraLogo from "../assets/petra-logo.png";

const WalletModal = ({ onClose }) => {
  const navigate = useNavigate(); // ✅ Fix here

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Connect Your PETRA Wallet</h2>
        <WalletConnect />

        <img
          src={petraLogo}
          alt="Petra Wallet Logo"
          style={{
            marginTop: "1rem",
            width: "70px",
            borderRadius: "12px",
            opacity: 0.9,
          }}
        />

        <div className="divider">OR</div>

        <div style={{ textAlign: 'center' }}>
          <button
            className="google-connect-btn"
            onClick={() => {
              navigate("/dashboard");
              onClose(); // ✅ Close modal
            }}
             // ✅ Simulate login
          >
            <img
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
              alt="Google Logo"
              className="google-icon"
            />
            Connect with Google
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
