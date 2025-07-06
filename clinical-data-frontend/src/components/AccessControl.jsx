import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import ClinicalDataService from '../services/ClinicalDataService';
import './AccessControl.css';

const AccessControl = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const clinicalDataService = new ClinicalDataService();

  useEffect(() => {
    if (account?.address) {
      loadPatientData();
      loadAccessLogs();
    }
  }, [account?.address]);

  const loadPatientData = async () => {
    try {
      const result = await clinicalDataService.getPatientData(account.address);
      if (result.success) {
        setPatientData(result.data);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const loadAccessLogs = async () => {
    try {
      const logs = await clinicalDataService.getAccessLogs(account.address);
      setAccessLogs(logs);
    } catch (error) {
      console.error('Error loading access logs:', error);
    }
  };

  const handleGrantAccess = async () => {
    if (!institutionAddress.trim()) {
      setMessage('Please enter an institution address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      // Create a mock signer for the transaction
      const mockSigner = {
        accountAddress: account.address,
        signTransaction: async (transaction) => {
          return await signAndSubmitTransaction(transaction);
        }
      };

      const result = await clinicalDataService.grantAccess(mockSigner, institutionAddress);
      
      if (result.success) {
        setMessage(`Access granted to ${institutionAddress}`);
        setMessageType('success');
        setInstitutionAddress('');
        loadPatientData();
        loadAccessLogs();
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

  const handleRevokeAccess = async (institutionAddr) => {
    setLoading(true);
    try {
      const mockSigner = {
        accountAddress: account.address,
        signTransaction: async (transaction) => {
          return await signAndSubmitTransaction(transaction);
        }
      };

      const result = await clinicalDataService.revokeAccess(mockSigner, institutionAddr);
      
      if (result.success) {
        setMessage(`Access revoked from ${institutionAddr}`);
        setMessageType('success');
        loadPatientData();
        loadAccessLogs();
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  if (!account?.address) {
    return (
      <div className="access-control-container">
        <div className="access-control-card">
          <h2>Access Control</h2>
          <p>Please connect your wallet to manage access control.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="access-control-container">
      <div className="access-control-card">
        <h2>Patient Access Control</h2>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="grant-access-section">
          <h3>Grant Access to Institution</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter institution address"
              value={institutionAddress}
              onChange={(e) => setInstitutionAddress(e.target.value)}
              disabled={loading}
            />
            <button 
              onClick={handleGrantAccess}
              disabled={loading || !institutionAddress.trim()}
              className="grant-btn"
            >
              {loading ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </div>

        {patientData && (
          <div className="patient-info-section">
            <h3>Your Patient Information</h3>
            <div className="patient-info">
              <p><strong>Address:</strong> {patientData.address}</p>
              <p><strong>Data Hash:</strong> {patientData.dataHash}</p>
              <p><strong>Consented Institutions:</strong></p>
              <ul className="institutions-list">
                {patientData.consentedInstitutions && patientData.consentedInstitutions.length > 0 ? (
                  patientData.consentedInstitutions.map((institution, index) => (
                    <li key={index} className="institution-item">
                      <span>{institution}</span>
                      <button 
                        onClick={() => handleRevokeAccess(institution)}
                        disabled={loading}
                        className="revoke-btn"
                      >
                        Revoke
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No institutions have access</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="access-logs-section">
          <h3>Access Logs</h3>
          <div className="logs-container">
            {accessLogs.length > 0 ? (
              accessLogs.map((log, index) => (
                <div key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-action">{log.action}</span>
                    <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <div className="log-details">
                    <p><strong>Accessor:</strong> {log.accessor}</p>
                    {log.institution && (
                      <p><strong>Institution:</strong> {log.institution}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No access logs found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl; 