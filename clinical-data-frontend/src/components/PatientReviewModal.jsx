import React, { useState } from "react";
import PatientDataService from "../services/PatientDataService";
import "./PatientReviewModal.css";

export default function PatientReviewModal({ 
  patient, 
  isOpen, 
  onClose, 
  onActionComplete,
  doctorAddress 
}) {
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  const handleApprove = async () => {
    if (!approvalNotes.trim()) {
      alert("Please provide approval notes.");
      return;
    }

    setIsLoading(true);
    setActionType('approve');

    try {
      const result = await PatientDataService.approvePatientData(
        patient.id,
        doctorAddress, // Use the doctor's address
        approvalNotes
      );
      
      alert(result.message);
      onActionComplete();
      onClose();
    } catch (error) {
      console.error("Error approving patient data:", error);
      alert("Failed to approve patient data. Please try again.");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      alert("Please provide rejection notes.");
      return;
    }

    setIsLoading(true);
    setActionType('reject');

    try {
      const result = await PatientDataService.rejectPatientData(
        patient.id,
        doctorAddress, // Use the doctor's address
        rejectionNotes
      );
      
      alert(result.message);
      onActionComplete();
      onClose();
    } catch (error) {
      console.error("Error rejecting patient data:", error);
      alert("Failed to reject patient data. Please try again.");
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="patient-review-modal-overlay">
      <div className="patient-review-modal">
        <div className="modal-header">
          <h2>Review Patient Data</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="patient-info">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Patient ID:</label>
                <span>{patient.id}</span>
              </div>
              <div className="info-item">
                <label>Age:</label>
                <span>{patient.age} years</span>
              </div>
              <div className="info-item">
                <label>Case Detection Date:</label>
                <span>{PatientDataService.formatDate(patient.caseDetectionDate)}</span>
              </div>
              <div className="info-item">
                <label>Uploaded On:</label>
                <span>{PatientDataService.formatDate(patient.uploadedAt)}</span>
              </div>
            </div>
          </div>

          <div className="medical-files">
            <h3>Medical Documents</h3>
            <div className="files-section">
              <div className="file-item">
                <h4>📄 Prescription PDF</h4>
                {patient.prescriptionUrl ? (
                  <div className="file-actions">
                    <a 
                      href={patient.prescriptionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      View Document
                    </a>
                    <span className="file-cid">CID: {patient.prescriptionCid}</span>
                  </div>
                ) : (
                  <span className="no-file">No prescription uploaded</span>
                )}
              </div>

              <div className="file-item">
                <h4>🖼️ MRI Image</h4>
                {patient.mriExists ? (
                  patient.mriUrl ? (
                    <div className="file-actions">
                      <a 
                        href={patient.mriUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        View Image
                      </a>
                      <span className="file-cid">CID: {patient.mriCid}</span>
                    </div>
                  ) : (
                    <span className="no-file">MRI not uploaded</span>
                  )
                ) : (
                  <span className="no-file">No MRI available</span>
                )}
              </div>

              <div className="file-item">
                <h4>📷 X-Ray Image</h4>
                {patient.xrayExists ? (
                  patient.xrayUrl ? (
                    <div className="file-actions">
                      <a 
                        href={patient.xrayUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        View Image
                      </a>
                      <span className="file-cid">CID: {patient.xrayCid}</span>
                    </div>
                  ) : (
                    <span className="no-file">X-Ray not uploaded</span>
                  )
                ) : (
                  <span className="no-file">No X-Ray available</span>
                )}
              </div>
            </div>
          </div>

          {patient.additionalNotes && (
            <div className="additional-notes">
              <h3>Additional Notes</h3>
              <p>{patient.additionalNotes}</p>
            </div>
          )}

          <div className="review-actions">
            <h3>Review Decision</h3>
            
            <div className="action-section">
              <h4>✅ Approve & Reward (0.1 APT)</h4>
              <textarea
                placeholder="Provide approval notes (optional but recommended)..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="notes-textarea"
                rows="3"
              />
              <button 
                className="approve-btn"
                onClick={handleApprove}
                disabled={isLoading}
              >
                {isLoading && actionType === 'approve' ? 'Processing...' : 'Approve & Send Reward'}
              </button>
            </div>

            <div className="action-section">
              <h4>❌ Reject</h4>
              <textarea
                placeholder="Provide rejection notes (required)..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                className="notes-textarea"
                rows="3"
                required
              />
              <button 
                className="reject-btn"
                onClick={handleReject}
                disabled={isLoading}
              >
                {isLoading && actionType === 'reject' ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 