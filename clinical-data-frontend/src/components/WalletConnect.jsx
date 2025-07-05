// src/components/WalletConnect.jsx
import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

const wallets = [new PetraWallet()];

export default function WalletConnect({ onConnectSuccess }) {
  const { connect, account, connected, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect(wallets[0].name);
      console.log("Connected:", account);
      if (onConnectSuccess) onConnectSuccess();
    } catch (err) {
      console.error('Wallet connection failed:', err);
    }
  };

  const getFormattedAddress = () => {
    if (!account?.address) return 'Unknown';
    if (typeof account.address === 'string') return account.address;
    if (typeof account.address.toString === 'function') return account.address.toString();
    if (account.address.data) {
      return (
        '0x' +
        Array.from(account.address.data)
          .map((x) => x.toString(16).padStart(2, '0'))
          .join('')
      );
    }
    return 'Invalid Address';
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
