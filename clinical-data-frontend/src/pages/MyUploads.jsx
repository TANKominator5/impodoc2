import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import PatientDataService from "../services/PatientDataService";
import PatientReviewModal from "../components/PatientReviewModal";
import "./MyUploads.css";

export default function MyUploads() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [allPatientData, setAllPatientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!connected || !currentUser) {
      navigate("/login");
      return;
    }

    fetchAllPatientData();
  }, [connected, currentUser, navigate]);

  const fetchAllPatientData = async () => {
    try {
      setLoading(true);
      const patients = await PatientDataService.getAllPatientData();
      const stats = await PatientDataService.getPatientStats();
      
      setAllPatientData(patients);
      setStats(stats);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setAllPatientData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const color = PatientDataService.getStatusColor(status);
    const text = PatientDataService.getStatusText(status);
    
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: color }}
      >
        {text}
      </span>
    );
  };

  const handleApprove = async (patientId) => {
    const approvalNotes = prompt("Please provide approval notes (optional):");
    
    try {
      const result = await PatientDataService.approvePatientData(
        patientId, 
        currentUser.address, 
        approvalNotes || ""
      );
      
      alert(result.message);
      fetchAllPatientData(); // Refresh the data
    } catch (error) {
      console.error("Error approving patient data:", error);
      alert("Failed to approve patient data. Please try again.");
    }
  };

  const handleReviewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowReviewModal(true);
  };

  const handleReviewComplete = () => {
    fetchAllPatientData(); // Refresh the data
  };

  if (!connected || !currentUser) {
    return (
      <div className="my-uploads-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to view uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-uploads-container">
      <div className="uploads-header">
        <h1>All Patient Uploads</h1>
        <p>View all patient data uploaded to the platform.</p>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Patients</h3>
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

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patient data...</p>
        </div>
      ) : allPatientData.length > 0 ? (
        <div className="uploads-list">
          {allPatientData.map((patient, index) => (
            <div key={patient.id} className="upload-card">
              <div className="card-header">
                <div className="patient-info">
                  <h3>Patient #{index + 1}</h3>
                  <p className="patient-address">{patient.userId}</p>
                </div>
                {getStatusBadge(patient.status)}
              </div>
              
              <div className="card-content">
                <div className="basic-info">
                  <h4>Basic Information</h4>
                  <div className="info-grid">
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
                    {patient.verifiedBy && (
                      <div className="info-item">
                        <label>Verified By:</label>
                        <span>{patient.verifiedBy}</span>
                      </div>
                    )}
                    {patient.verifiedAt && (
                      <div className="info-item">
                        <label>Verified On:</label>
                        <span>{PatientDataService.formatDate(patient.verifiedAt)}</span>
                      </div>
                    )}
                    {patient.approvalNotes && (
                      <div className="info-item">
                        <label>Approval Notes:</label>
                        <span>{patient.approvalNotes}</span>
                      </div>
                    )}
                    {patient.rejectionNotes && (
                      <div className="info-item">
                        <label>Rejection Notes:</label>
                        <span>{patient.rejectionNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="medical-files">
                  <h4>Medical Documents</h4>
                  <div className="files-grid">
                    <div className="file-card">
                      <div className="file-header">
                        <span className="file-icon">📄</span>
                        <span className="file-name">Prescription PDF</span>
                      </div>
                      <div className="file-content">
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
                    </div>

                    <div className="file-card">
                      <div className="file-header">
                        <span className="file-icon">🖼️</span>
                        <span className="file-name">MRI Image</span>
                      </div>
                      <div className="file-content">
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
                    </div>

                    <div className="file-card">
                      <div className="file-header">
                        <span className="file-icon">📷</span>
                        <span className="file-name">X-Ray Image</span>
                      </div>
                      <div className="file-content">
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
                </div>

                {patient.additionalNotes && (
                  <div className="additional-notes">
                    <h4>Additional Notes</h4>
                    <p>{patient.additionalNotes}</p>
                  </div>
                )}

                {/* Doctor Actions */}
                {currentUser.role === "Doctor" && patient.status === "pending" && (
                  <div className="doctor-actions">
                    <h4>Doctor Actions</h4>
                    <div className="action-buttons">
                      <button 
                        className="review-btn"
                        onClick={() => handleReviewPatient(patient)}
                      >
                        🔍 Review & Decide
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-uploads">
          <div className="no-uploads-icon">📭</div>
          <h3>No Patient Data Found</h3>
          <p>No patient data has been uploaded to the platform yet.</p>
        </div>
      )}

      {/* Patient Review Modal */}
      <PatientReviewModal
        patient={selectedPatient}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedPatient(null);
        }}
        onActionComplete={handleReviewComplete}
        doctorAddress={currentUser?.address}
      />
    </div>
  );
} 