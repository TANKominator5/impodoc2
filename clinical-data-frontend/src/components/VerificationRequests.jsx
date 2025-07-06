import React, { useState, useEffect } from 'react';
import VerificationService from '../services/VerificationService';
import './VerificationRequests.css';

const VerificationRequests = ({ adminAddress }) => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadVerifications();
    loadStats();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const allVerifications = await VerificationService.getAllVerifications();
      setVerifications(allVerifications);
    } catch (error) {
      console.error('Error loading verifications:', error);
      alert('Failed to load verification requests');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await VerificationService.getVerificationStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (verificationId) => {
    if (!reviewNotes.trim()) {
      alert('Please provide review notes before approving');
      return;
    }

    setProcessing(true);
    try {
      await VerificationService.approveVerification(verificationId, adminAddress, reviewNotes);
      alert('Verification approved successfully!');
      setShowModal(false);
      setReviewNotes('');
      setSelectedVerification(null);
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verificationId) => {
    if (!reviewNotes.trim()) {
      alert('Please provide review notes before rejecting');
      return;
    }

    setProcessing(true);
    try {
      await VerificationService.rejectVerification(verificationId, adminAddress, reviewNotes);
      alert('Verification rejected successfully!');
      setShowModal(false);
      setReviewNotes('');
      setSelectedVerification(null);
      loadVerifications();
      loadStats();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (verification, action) => {
    setSelectedVerification({ ...verification, action });
    setShowModal(true);
    setReviewNotes('');
  };

  const filteredVerifications = verifications.filter(v => {
    if (selectedTab === 'pending') return v.status === 'pending';
    if (selectedTab === 'approved') return v.status === 'approved';
    if (selectedTab === 'rejected') return v.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="verification-requests">
        <div className="loading">Loading verification requests...</div>
      </div>
    );
  }

  return (
    <div className="verification-requests">
      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Requests</h3>
          <p>{stats.total || 0}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{stats.pending || 0}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p>{stats.approved || 0}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p>{stats.rejected || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Doctors</h3>
          <p>{stats.doctors || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Researchers</h3>
          <p>{stats.researchers || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${selectedTab === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedTab('pending')}
        >
          Pending ({stats.pending || 0})
        </button>
        <button 
          className={`tab ${selectedTab === 'approved' ? 'active' : ''}`}
          onClick={() => setSelectedTab('approved')}
        >
          Approved ({stats.approved || 0})
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

      {/* Verification Requests List */}
      <div className="requests-list">
        {filteredVerifications.length === 0 ? (
          <div className="no-requests">
            <p>No {selectedTab} verification requests found.</p>
          </div>
        ) : (
          filteredVerifications.map((verification) => (
            <div key={verification.id} className="request-card">
              <div className="request-header">
                <div className="user-info">
                  <h4>{verification.role}</h4>
                  <p className="user-address">{verification.userId}</p>
                </div>
                <div className="status-badge" style={{ backgroundColor: VerificationService.getStatusColor(verification.status) }}>
                  {verification.status.toUpperCase()}
                </div>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="label">NMR Number:</span>
                  <span>{verification.nmrNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">UID Number:</span>
                  <span>{verification.uidNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Specialization:</span>
                  <span>{verification.specialization}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Institution:</span>
                  <span>{verification.institution}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{verification.yearsExperience} years</span>
                </div>
                {verification.licenseNumber && (
                  <div className="detail-row">
                    <span className="label">License Number:</span>
                    <span>{verification.licenseNumber}</span>
                  </div>
                )}
                {verification.additionalCredentials && (
                  <div className="detail-row">
                    <span className="label">Additional Credentials:</span>
                    <span>{verification.additionalCredentials}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Submitted:</span>
                  <span>{VerificationService.formatDate(verification.submittedAt)}</span>
                </div>
                {verification.reviewedAt && (
                  <div className="detail-row">
                    <span className="label">Reviewed:</span>
                    <span>{VerificationService.formatDate(verification.reviewedAt)}</span>
                  </div>
                )}
                {verification.reviewNotes && (
                  <div className="detail-row">
                    <span className="label">Review Notes:</span>
                    <span>{verification.reviewNotes}</span>
                  </div>
                )}
              </div>

              {verification.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="approve-btn"
                    onClick={() => openReviewModal(verification, 'approve')}
                  >
                    Approve
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => openReviewModal(verification, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedVerification && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedVerification.action === 'approve' ? 'Approve' : 'Reject'} Verification</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>User:</strong> {selectedVerification.userId}<br/>
                <strong>Role:</strong> {selectedVerification.role}<br/>
                <strong>Specialization:</strong> {selectedVerification.specialization}
              </p>
              <div className="form-group">
                <label htmlFor="reviewNotes">Review Notes *</label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide notes for your decision..."
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
                className={selectedVerification.action === 'approve' ? 'approve-btn' : 'reject-btn'}
                onClick={() => selectedVerification.action === 'approve' 
                  ? handleApprove(selectedVerification.id) 
                  : handleReject(selectedVerification.id)
                }
                disabled={processing || !reviewNotes.trim()}
              >
                {processing ? 'Processing...' : (selectedVerification.action === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationRequests; 