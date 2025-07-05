import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./MyUploads.css";

export default function MyUploads() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!connected || !currentUser) {
      navigate("/login");
      return;
    }

    fetchPatientData();
  }, [connected, currentUser, navigate]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientRef = doc(db, "patients", currentUser.address);
      const patientSnap = await getDoc(patientRef);
      
      if (patientSnap.exists()) {
        setPatientData(patientSnap.data());
      } else {
        setPatientData(null);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#f59e0b", text: "Pending Review" },
      verified: { color: "#10b981", text: "Verified" },
      rejected: { color: "#ef4444", text: "Rejected" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: config.color }}
      >
        {config.text}
      </span>
    );
  };

  if (!connected || !currentUser) {
    return (
      <div className="my-uploads-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to view your uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-uploads-container">
      <div className="uploads-header">
        <h1>My Uploads</h1>
        <p>View and manage your uploaded medical documents.</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your uploads...</p>
        </div>
      ) : patientData ? (
        <div className="upload-details">
          <div className="upload-card">
            <div className="card-header">
              <h3>Your Medical Data</h3>
              {getStatusBadge(patientData.status)}
            </div>
            
            <div className="card-content">
              <div className="basic-info">
                <h4>Basic Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Age:</label>
                    <span>{patientData.age} years</span>
                  </div>
                  <div className="info-item">
                    <label>Case Detection Date:</label>
                    <span>{formatDate(patientData.caseDetectionDate)}</span>
                  </div>
                  <div className="info-item">
                    <label>Uploaded On:</label>
                    <span>{formatDate(patientData.uploadedAt)}</span>
                  </div>
                  {patientData.verifiedBy && (
                    <div className="info-item">
                      <label>Verified By:</label>
                      <span>{patientData.verifiedBy}</span>
                    </div>
                  )}
                  {patientData.verifiedAt && (
                    <div className="info-item">
                      <label>Verified On:</label>
                      <span>{formatDate(patientData.verifiedAt)}</span>
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
                      {patientData.prescriptionUrl ? (
                        <div className="file-actions">
                          <a 
                            href={patientData.prescriptionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-btn"
                          >
                            View Document
                          </a>
                          <span className="file-cid">CID: {patientData.prescriptionCid}</span>
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
                      {patientData.mriExists ? (
                        patientData.mriUrl ? (
                          <div className="file-actions">
                            <a 
                              href={patientData.mriUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              View Image
                            </a>
                            <span className="file-cid">CID: {patientData.mriCid}</span>
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
                      {patientData.xrayExists ? (
                        patientData.xrayUrl ? (
                          <div className="file-actions">
                            <a 
                              href={patientData.xrayUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              View Image
                            </a>
                            <span className="file-cid">CID: {patientData.xrayCid}</span>
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

              {patientData.additionalNotes && (
                <div className="notes-section">
                  <h4>Additional Notes</h4>
                  <div className="notes-content">
                    <p>{patientData.additionalNotes}</p>
                  </div>
                </div>
              )}

              <div className="upload-actions">
                <button 
                  className="upload-new-btn"
                  onClick={() => navigate("/upload-patient-data")}
                >
                  Upload New Data
                </button>
                <button 
                  className="back-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-uploads">
          <div className="no-uploads-icon">��</div>
          <h3>No Uploads Found</h3>
          <p>You haven't uploaded any medical data yet.</p>
          <button 
            className="upload-first-btn"
            onClick={() => navigate("/upload-patient-data")}
          >
            Upload Your First Data
          </button>
        </div>
      )}
    </div>
  );
} 