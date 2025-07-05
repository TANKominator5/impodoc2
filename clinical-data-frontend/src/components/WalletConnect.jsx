// src/components/WalletConnect.jsx
import React, { useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function WalletConnect({ onConnectSuccess }) {
  // 🔴 Let's see what the useWallet hook is giving us.
  const { connect, account, connected, disconnect, wallet, wallets } = useWallet();
  const { handleUserConnect, isFirstTimeUser } = useAuth();
  const navigate = useNavigate();

  console.log('🔴 WalletConnect: Hook state', { 
    connected, 
    account: account?.address, 
    wallet: wallet?.name,
    availableWallets: wallets.map(w => w.name),
    isFirstTimeUser
  });

  useEffect(() => {
    if (connected && account) {
      console.log("✅ Wallet connected, calling handleUserConnect in context...");
      handleUserConnect(account);
      
      // Check if this is a first-time user and redirect accordingly
      if (isFirstTimeUser) {
        console.log("✅ First-time user detected, redirecting to My Account...");
        navigate("/my-account");
      } else if (onConnectSuccess) {
        console.log("✅ Calling onConnectSuccess callback...");
        onConnectSuccess();
      }
    }
  }, [connected, account, handleUserConnect, onConnectSuccess, isFirstTimeUser, navigate]);

  const handleConnect = async () => {
    console.log("🔵 handleConnect function triggered!"); // Did we get this far?

    // The wallet adapter sometimes needs you to specify which wallet to connect to.
    // PetraWallet's standard name is 'Petra'.
    const petraWallet = wallets.find(w => w.name === 'Petra');

    if (!petraWallet) {
        console.error("❌ ERROR: Petra Wallet not found among available wallets. Make sure the extension is installed and active.");
        alert("Petra Wallet not found. Please ensure the browser extension is installed and enabled.");
        return;
    }
    
    console.log(`Attempting to connect with: ${petraWallet.name}`);

    try {
      // We explicitly pass the wallet name to the connect function.
      await connect(petraWallet.name);
      console.log("✅ connect() function was successful.");
    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      alert(`Wallet connection failed. See console for details.`);
    }
  };

  const getFormattedAddress = () => {
    if (!account?.address) return 'Unknown';
    return account.address.toString();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      {connected && account ? (
        <>
          <p><strong>Wallet:</strong> {getFormattedAddress()}</p>
          <button onClick={disconnect} className="wallet-connect-btn">
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={handleConnect} className="wallet-connect-btn">
          Connect Petra Wallet
        </button>
      )}
    </div>
  );
}