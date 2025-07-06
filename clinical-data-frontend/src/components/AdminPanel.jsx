import React, { useState, useEffect } from 'react';
import VerificationRequests from './VerificationRequests';

import './AdminPanel.css';

const AdminPanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ KEEP YOUR ADMIN WALLET ADDRESSES HERE
  const ADMIN_WALLET_ADDRESSES = [
    '0x7fbf95bb2c9bfd7b7e0e322c7a37ed7ed62e3ff525741be5262d86d2d4469341', // Replace with your wallet address
    // Add more admin addresses as needed
  ];

  // Check if Petra wallet is available
  const isPetraAvailable = () => {
    return typeof window !== 'undefined' && window.aptos;
  };

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check if wallet is already connected
  const checkConnectionStatus = async () => {
    if (!isPetraAvailable()) {
      console.log('Petra wallet not available');
      return;
    }

    try {
      const connected = await window.aptos.isConnected();
      if (connected) {
        const account = await window.aptos.account();
        setAccount(account);
        setIsConnected(true);
        console.log('Wallet already connected:', account);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnect = async () => {
    if (!isPetraAvailable()) {
      alert('Petra wallet is not installed. Please install the Petra wallet extension first.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to connect wallet...');
      
      // Connect to the wallet using window.aptos.connect()
      await window.aptos.connect();
      
      // Get account information
      const account = await window.aptos.account();
      
      console.log('Wallet connected successfully:', account);
      
      setAccount(account);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!isPetraAvailable()) {
      return;
    }

    try {
      await window.aptos.disconnect();
      setAccount(null);
      setIsConnected(false);
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // This logic remains the same: check if the connected account is an admin
  const isAdmin = isConnected && account?.address && ADMIN_WALLET_ADDRESSES.includes(account.address);

  const getFormattedAddress = () => {
    if (!account?.address) return 'Unknown';
    return `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
  };

  // Helper function to render the main content based on connection and admin status
  const renderContent = () => {
    // 1. If connected and the user is an admin
    if (isAdmin) {
      return (
        <div className="admin-dashboard">
          <div className="admin-welcome">
            <div className="admin-avatar">
              <span>👨‍💼</span>
            </div>
            <div className="admin-info">
              <h2>Welcome, Administrator</h2>
              <p>Manage verification requests and platform operations</p>
              <div className="wallet-info">
                <span className="wallet-label">Connected Wallet:</span>
                <span className="wallet-address">{getFormattedAddress()}</span>
              </div>
            </div>
            <button 
              onClick={handleDisconnect} 
              className="disconnect-btn"
            >
              <span>🔌</span>
              Disconnect
            </button>
          </div>
          
          {/* Verification Requests Component */}
          <div className="verification-section">
            <div className="section-header">
              <h3>🔍 Verification Management</h3>
              <p>Review and manage doctor and researcher verification requests</p>
            </div>
            <VerificationRequests adminAddress={account.address} />
          </div>
        </div>
      );
    }

    // 2. If connected but the user is NOT an admin
    if (isConnected) {
      return (
        <div className="unauthorized-section">
          <div className="unauthorized-icon">
            <span>🚫</span>
          </div>
          <h2>Access Denied</h2>
          <p>This wallet is not authorized for admin access.</p>
          <div className="wallet-info">
            <span className="wallet-label">Connected Wallet:</span>
            <span className="wallet-address">{getFormattedAddress()}</span>
          </div>
          <p className="contact-info">Please contact the system administrator to get admin privileges.</p>
          <button 
            onClick={handleDisconnect} 
            className="disconnect-btn"
          >
            <span>🔌</span>
            Disconnect
          </button>
        </div>
      );
    }
    
    // 3. If not connected at all
    return (
      <div className="connect-section">
        <div className="connect-icon">
          <span>🔐</span>
        </div>
        <h2>Admin Access Required</h2>
        <p>Connect your wallet to access the admin panel</p>
        {!isPetraAvailable() ? (
          <div className="wallet-install">
            <p>Petra wallet is not installed</p>
            <a 
              href="https://petra.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-link"
            >
              <span>📥</span>
              Install Petra Wallet
            </a>
          </div>
        ) : (
          <button 
            onClick={handleConnect} 
            className="connect-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span>🔗</span>
                Connect Petra Wallet
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        <div className="admin-panel-header">
          <div className="header-content">
            <h1>Admin Panel</h1>
            <p>Secure platform administration</p>
          </div>
        </div>
        
        <div className="admin-panel-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;