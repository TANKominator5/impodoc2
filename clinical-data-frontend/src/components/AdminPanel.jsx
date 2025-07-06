// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import ClinicalDataService from '../services/ClinicalDataService';
import { RewardService } from '../services/RewardService';
import './AdminPanel.css';

const AdminPanel = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [patients, setPatients] = useState([]);
  const [newPatientAddress, setNewPatientAddress] = useState('');
  const [newPatientDataHash, setNewPatientDataHash] = useState('');
  const [rewardRecipient, setRewardRecipient] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeTab, setActiveTab] = useState('patients');

  const clinicalDataService = new ClinicalDataService();
  const rewardService = new RewardService();

  useEffect(() => {
    if (account?.address) {
      loadPatients();
    }
  }, [account?.address]);

  const loadPatients = async () => {
    try {
      const patientsData = await clinicalDataService.getAllPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleAddPatient = async () => {
    if (!newPatientAddress.trim() || !newPatientDataHash.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const mockSigner = {
        accountAddress: account.address,
        signTransaction: async (transaction) => {
          return await signAndSubmitTransaction(transaction);
        }
      };

      const result = await clinicalDataService.addPatient(mockSigner, newPatientAddress, newPatientDataHash);
      
      if (result.success) {
        setMessage(`Patient ${newPatientAddress} added successfully`);
        setMessageType('success');
        setNewPatientAddress('');
        setNewPatientDataHash('');
        loadPatients();
      } else {
        setMessage(`Error: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRewardContribution = async () => {
    if (!rewardRecipient.trim() || !rewardAmount.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    const amount = parseInt(rewardAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const mockSigner = {
        accountAddress: account.address,
        signTransaction: async (transaction) => {
          return await signAndSubmitTransaction(transaction);
        }
      };

      const result = await clinicalDataService.rewardContribution(mockSigner, rewardRecipient, amount);
      
      if (result.success) {
        setMessage(`Rewarded ${amount} tokens to ${rewardRecipient}`);
        setMessageType('success');
        setRewardRecipient('');
        setRewardAmount('');
      } else {
        setMessage(`Error: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokenBalance = async (address) => {
    try {
      const result = await clinicalDataService.getTokenBalance(address);
      if (result.success) {
        setMessage(`Token balance for ${address}: ${result.balance}`);
        setMessageType('success');
      } else {
        setMessage(`Error getting balance: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  if (!account?.address) {
    return (
      <div className="admin-panel-container">
        <div className="admin-panel-card">
          <h2>Admin Panel</h2>
          <p>Please connect your wallet to access admin features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-card">
        <h2>Admin Panel</h2>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            Patient Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            Reward System
          </button>
          <button 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Access Logs
          </button>
        </div>

        {activeTab === 'patients' && (
          <div className="tab-content">
            <div className="add-patient-section">
              <h3>Add New Patient</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Patient Address"
                  value={newPatientAddress}
                  onChange={(e) => setNewPatientAddress(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="text"
                  placeholder="Data Hash"
                  value={newPatientDataHash}
                  onChange={(e) => setNewPatientDataHash(e.target.value)}
                  disabled={loading}
                />
                <button 
                  onClick={handleAddPatient}
                  disabled={loading || !newPatientAddress.trim() || !newPatientDataHash.trim()}
                  className="add-btn"
                >
                  {loading ? 'Adding...' : 'Add Patient'}
                </button>
              </div>
            </div>

            <div className="patients-list-section">
              <h3>Registered Patients</h3>
              <div className="patients-grid">
                {patients.map((patient, index) => (
                  <div key={index} className="patient-card">
                    <div className="patient-header">
                      <h4>Patient {index + 1}</h4>
                      <button 
                        onClick={() => handleGetTokenBalance(patient.address)}
                        className="balance-btn"
                      >
                        Check Balance
                      </button>
                    </div>
                    <div className="patient-details">
                      <p><strong>Address:</strong> {patient.address}</p>
                      <p><strong>Data Hash:</strong> {patient.dataHash}</p>
                      <p><strong>Consented Institutions:</strong> {patient.consentedInstitutions?.length || 0}</p>
                      <p><strong>Created:</strong> {formatTimestamp(patient.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="tab-content">
            <div className="reward-section">
              <h3>Reward Contributors</h3>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Recipient Address"
                  value={rewardRecipient}
                  onChange={(e) => setRewardRecipient(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="number"
                  placeholder="Token Amount"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  disabled={loading}
                />
                <button 
                  onClick={handleRewardContribution}
                  disabled={loading || !rewardRecipient.trim() || !rewardAmount.trim()}
                  className="reward-btn"
                >
                  {loading ? 'Rewarding...' : 'Reward Contributor'}
                </button>
              </div>
            </div>

            <div className="reward-stats-section">
              <h3>Reward Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Patients</h4>
                  <p>{patients.length}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Rewards</h4>
                  <p>Coming Soon</p>
                </div>
                <div className="stat-card">
                  <h4>Active Contracts</h4>
                  <p>1</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="tab-content">
            <div className="logs-section">
              <h3>System Access Logs</h3>
              <div className="logs-container">
                <p>Access logs will be displayed here. This feature tracks all access events across the system.</p>
                {/* Logs will be populated here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;