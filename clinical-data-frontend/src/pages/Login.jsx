import React, { useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Login.css';

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
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card glass-card">
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">🔬</div>
              <h1 className="login-title">
                Welcome to <span className="brand-highlight">Impodoc</span>
              </h1>
            </div>
            <p className="login-subtitle">
              Connect your Petra wallet to access the future of medical research
            </p>
          </div>

          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure Authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span className="feature-text">Earn APT Rewards</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <span className="feature-text">Global Impact</span>
            </div>
          </div>

          <div className="security-notice">
            <div className="notice-icon">🛡️</div>
            <div className="notice-content">
              <h4>Privacy First</h4>
              <p>Your wallet address is used for secure authentication. No personal information is required for login.</p>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-large login-btn"
            onClick={handleLogin}
          >
            <span className="btn-icon">🔗</span>
            Connect Petra Wallet
          </button>

          <div className="wallet-info">
            <p className="wallet-text">
              Don't have Petra Wallet? 
              <a 
                href="https://petra.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="wallet-link"
              >
                Download here
              </a>
            </p>
          </div>
        </div>

        <div className="login-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-number">10,000+</span>
              <span className="stat-label">Cases Shared</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Verified Doctors</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">APT Rewards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 