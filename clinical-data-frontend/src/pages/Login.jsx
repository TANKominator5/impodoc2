import React, { useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Login.css';

const gradientCard = {
  background: "linear-gradient(135deg, #1e293b 60%, #0ea5e9 100%)",
  borderRadius: "1.2rem",
  boxShadow: "0 4px 32px 0 rgba(14,165,233,0.10)",
  padding: "2rem",
  marginBottom: "2rem",
  color: "#f1f5f9",
};

const button = {
  background: "linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "1.1rem",
  padding: "0.85rem 2.2rem",
  border: "none",
  borderRadius: "2rem",
  boxShadow: "0 4px 24px 0 rgba(80,80,120,0.10)",
  cursor: "pointer",
  transition: "transform 0.12s, box-shadow 0.12s",
  marginTop: "1rem",
};

export default function Login() {
  const { connect, account, connected, wallets } = useWallet();
  const { handleUserConnect } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const petraWallet = wallets.find(w => w.name === 'Petra');

    if (!petraWallet) {
      alert("Petra Wallet not found. Please ensure the browser extension is installed and enabled.");
      return;
    }

    try {
      await connect(petraWallet.name);
    } catch (err) {
      console.error('Wallet connection failed:', err);
      alert('Wallet connection failed. Please try again.');
    }
  };

  // Check if user is already connected and has a profile
  useEffect(() => {
    const checkUserProfile = async () => {
      if (connected && account) {
        const userAddress = account.address.toString();
        const userRef = doc(db, "users", userAddress);
        
        try {
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // If user has a proper name (not "Anonymous User"), redirect to dashboard
            if (userData.name && userData.name !== "Anonymous User") {
              handleUserConnect(account);
              navigate("/dashboard");
            } else {
              // User exists but needs to complete profile
              handleUserConnect(account);
              navigate("/my-account");
            }
          } else {
            // New user, redirect to account setup
            handleUserConnect(account);
            navigate("/my-account");
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
        }
      }
    };

    checkUserProfile();
  }, [connected, account, handleUserConnect, navigate]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(120deg, #0f172a 60%, #0ea5e9 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{ ...gradientCard, maxWidth: 500, textAlign: "center" }}>
        <h1 style={{ 
          color: "#f1f5f9", 
          fontWeight: 800, 
          fontSize: "2.5rem",
          marginBottom: "1rem"
        }}>
          Welcome to Impodoc
        </h1>
        <p style={{ 
          color: "#94a3b8", 
          fontSize: "1.1rem",
          marginBottom: "2rem"
        }}>
          Connect your Petra wallet to access the platform
        </p>
        
        <div style={{ 
          background: "rgba(14, 165, 233, 0.1)", 
          border: "1px solid #0ea5e9", 
          borderRadius: "0.5rem", 
          padding: "1rem",
          color: "#bae6fd",
          fontSize: "0.9rem",
          marginBottom: "2rem"
        }}>
          <strong>🔒 Secure Authentication:</strong> Your wallet address is used for secure authentication. 
          No personal information is required for login.
        </div>

        <button 
          onClick={handleLogin}
          style={button}
          onMouseOver={e => {e.currentTarget.style.transform='scale(1.04)';}}
          onMouseOut={e => {e.currentTarget.style.transform='scale(1)';}}
        >
          Connect Petra Wallet
        </button>
        
        <div style={{ 
          marginTop: "2rem",
          color: "#64748b",
          fontSize: "0.9rem"
        }}>
          Don't have Petra Wallet? 
          <a 
            href="https://petra.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: "#0ea5e9", 
              textDecoration: "none",
              marginLeft: "0.5rem"
            }}
          >
            Download here
          </a>
        </div>
      </div>
    </div>
  );
} 