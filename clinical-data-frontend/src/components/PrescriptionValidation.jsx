import React, { useState, useEffect } from 'react';
import PrescriptionValidationService from '../services/PrescriptionValidationService';
import './PrescriptionValidation.css';

const PrescriptionValidation = ({ doctorAddress }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [permissionCheck, setPermissionCheck] = useState({ hasPermission: false, reason: '' });

  useEffect(() => {
    checkPermissions();
    loadPrescriptions();
    loadStats();
  }, []);

  const checkPermissions = async () => {
    try {
      const permission = await PrescriptionValidationService.validateDoctorPermissions(doctorAddress);
      setPermissionCheck(permission);
      
      if (!permission.hasPermission) {
        console.error('Permission denied:', permission.reason);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionCheck({ hasPermission: false, reason: 'Error checking permissions' });
    }
  };

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const allPrescriptions = await PrescriptionValidationService.getAllPrescriptions();
      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      alert('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await PrescriptionValidationService.getPrescriptionStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleValidate = async (prescriptionId) => {
    if (!validationNotes.trim()) {
      alert('Please provide validation notes before approving');
      return;
    }

    setProcessing(true);
    try {
      const result = await PrescriptionValidationService.validatePrescription(
        prescriptionId, 
        doctorAddress, 
        validationNotes
      );
      alert(result.message);
      setShowModal(false);
      setValidationNotes('');
      setSelectedPrescription(null);
      loadPrescriptions();
      loadStats();
    } catch (error) {
      console.error('Error validating prescription:', error);
      alert('Failed to validate prescription');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (prescriptionId) => {
    if (!validationNotes.trim()) {
      alert('Please provide rejection notes before rejecting');
      return;
    }

    setProcessing(true);
    try {
      const result = await PrescriptionValidationService.rejectPrescription(
        prescriptionId, 
        doctorAddress, 
        validationNotes
      );
      alert(result.message);
      setShowModal(false);
      setValidationNotes('');
      setSelectedPrescription(null);
      loadPrescriptions();
      loadStats();
    } catch (error) {
      console.error('Error rejecting prescription:', error);
      alert('Failed to reject prescription');
    } finally {
      setProcessing(false);
    }
  };

  const openValidationModal = (prescription, action) => {
    setSelectedPrescription({ ...prescription, action });
    setShowModal(true);
    setValidationNotes('');
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    if (selectedTab === 'pending') return p.status === 'pending';
    if (selectedTab === 'verified') return p.status === 'verified';
    if (selectedTab === 'rejected') return p.status === 'rejected';
    return true;
  });

  if (!permissionCheck.hasPermission) {
    return (
      <div className="prescription-validation">
        <div className="permission-denied">
          <div className="denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>{permissionCheck.reason}</p>
          <p>Only verified doctors can validate prescriptions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="prescription-validation">
        <div className="loading">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="prescription-validation">
      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Prescriptions</h3>
          <p>{stats.total || 0}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending Review</h3>
          <p>{stats.pending || 0}</p>
        </div>
        <div className="stat-card verified">
          <h3>Verified</h3>
          <p>{stats.verified || 0}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p>{stats.rejected || 0}</p>
        </div>
        <div className="stat-card rewards">
          <h3>Total Rewards</h3>
          <p>{stats.totalRewardsDistributed || 0} APT</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pending')}
        >
          Pending Review ({stats.pending || 0})
        </button>
        <button 
          className={`tab ${selectedTab === 'verified' ? 'active' : ''}`}
          onClick={() => setSelectedTab('verified')}
        >
          Verified ({stats.verified || 0})
        </button>
        <button 
          className={`tab ${selectedTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setSelectedTab('rejected')}
        >
          Rejected ({stats.rejected || 0})
        </button>
        <button 
          className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTab('all')}
        >
          All ({stats.total || 0})
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="prescriptions-list">
        {filteredPrescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <p>No {selectedTab} prescriptions found.</p>
          </div>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="prescription-card">
              <div className="prescription-header">
                <div className="patient-info">
                  <h4>Patient Prescription</h4>
                  <p className="patient-address">{prescription.userId}</p>
                </div>
                <div className="status-badge" style={{ backgroundColor: PrescriptionValidationService.getStatusColor(prescription.status) }}>
                  {prescription.status.toUpperCase()}
                </div>
              </div>

              <div className="prescription-details">
                <div className="detail-row">
                  <span className="label">Age:</span>
                  <span>{prescription.age} years</span>
                </div>
                <div className="detail-row">
                  <span className="label">Case Detection Date:</span>
                  <span>{prescription.caseDetectionDate}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Uploaded:</span>
                  <span>{PrescriptionValidationService.formatDate(prescription.uploadedAt)}</span>
                </div>
                {prescription.verifiedAt && (
                  <div className="detail-row">
                    <span className="label">Reviewed:</span>
                    <span>{PrescriptionValidationService.formatDate(prescription.verifiedAt)}</span>
                  </div>
                )}
                {prescription.validationNotes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span>{prescription.validationNotes}</span>
                  </div>
                )}
              </div>

              {/* Document Links */}
              <div className="documents-section">
                <h5>Medical Documents</h5>
                <div className="document-links">
                  {prescription.prescriptionUrl && (
                    <a 
                      href={prescription.prescriptionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-link prescription"
                    >
                      📄 View Prescription PDF
                    </a>
                  )}
                  {prescription.mriUrl && (
                    <a 
                      href={prescription.mriUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-link mri"
                    >
                      🧠 View MRI Image
                    </a>
                  )}
                  {prescription.xrayUrl && (
                    <a 
                      href={prescription.xrayUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-link xray"
                    >
                      📷 View X-Ray Image
                    </a>
                  )}
                </div>
              </div>

              {prescription.status === 'pending' && (
                <div className="prescription-actions">
                  <button 
                    className="validate-btn"
                    onClick={() => openValidationModal(prescription, 'validate')}
                  >
                    ✅ Validate & Reward (0.1 APT)
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => openValidationModal(prescription, 'reject')}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Validation Modal */}
      {showModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {selectedPrescription.action === 'validate' ? 'Validate Prescription' : 'Reject Prescription'}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Patient:</strong> {selectedPrescription.userId}<br/>
                <strong>Age:</strong> {selectedPrescription.age} years<br/>
                <strong>Case Date:</strong> {selectedPrescription.caseDetectionDate}
              </p>
              
              {selectedPrescription.action === 'validate' && (
                <div className="reward-notice">
                  <h4>🎁 Reward Information</h4>
                  <p>Upon validation, the patient will receive <strong>0.1 APT</strong> from the admin's testnet wallet.</p>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="validationNotes">
                  {selectedPrescription.action === 'validate' ? 'Validation Notes *' : 'Rejection Notes *'}
                </label>
                <textarea
                  id="validationNotes"
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder={selectedPrescription.action === 'validate' 
                    ? "Provide notes for your validation decision..." 
                    : "Provide notes for your rejection decision..."
                  }
                  rows="4"
                  required
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className={selectedPrescription.action === 'validate' ? 'validate-btn' : 'reject-btn'}
                onClick={() => selectedPrescription.action === 'validate' 
                  ? handleValidate(selectedPrescription.id) 
                  : handleReject(selectedPrescription.id)
                }
                disabled={processing || !validationNotes.trim()}
              >
                {processing ? 'Processing...' : (selectedPrescription.action === 'validate' ? 'Validate & Reward' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionValidation; 