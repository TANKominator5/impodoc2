import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./PatientDataView.css";

export default function PatientDataView() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!connected || !currentUser) {
      navigate("/login");
      return;
    }

    // Check if user is verified doctor or researcher
    if (currentUser.verificationStatus !== "approved") {
      navigate("/verification");
      return;
    }

    fetchPatients();
  }, [connected, currentUser, navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const patientsRef = collection(db, "patients");
      const q = query(patientsRef, where("status", "in", ["pending", "verified"]));
      const querySnapshot = await getDocs(q);
      
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesStatus = filterStatus === "all" || patient.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      patient.age.toString().includes(searchTerm) ||
      patient.caseDetectionDate.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

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
      <div className="patient-data-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to view patient data.</p>
        </div>
      </div>
    );
  }

  if (currentUser.verificationStatus !== "approved") {
    return (
      <div className="patient-data-container">
        <div className="access-denied">
          <h1>Verification Required</h1>
          <p>Your account needs to be verified to access patient data.</p>
          <button 
            className="verification-btn"
            onClick={() => navigate("/verification")}
          >
            Submit Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-data-container">
      <div className="data-header">
        <h1>Patient Data</h1>
        <p>View and analyze patient cases for research and medical purposes.</p>
      </div>

      <div className="controls-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by age or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="verified">Verified</option>
          </select>
        </div>
        
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{filteredPatients.length}</span>
            <span className="stat-label">Total Cases</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {filteredPatients.filter(p => p.status === "pending").length}
            </span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {filteredPatients.filter(p => p.status === "verified").length}
            </span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patient data...</p>
        </div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📋</div>
              <h3>No Patient Data Found</h3>
              <p>No patients match your current filters.</p>
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div key={patient.id} className="patient-card">
                <div className="card-header">
                  <h3>Patient Case</h3>
                  {getStatusBadge(patient.status)}
                </div>
                
                <div className="card-content">
                  <div className="patient-info">
                    <div className="info-row">
                      <label>Age:</label>
                      <span>{patient.age} years</span>
                    </div>
                    <div className="info-row">
                      <label>Case Detection:</label>
                      <span>{formatDate(patient.caseDetectionDate)}</span>
                    </div>
                    <div className="info-row">
                      <label>Uploaded:</label>
                      <span>{formatDate(patient.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="medical-files">
                    <h4>Medical Files</h4>
                    <div className="file-list">
                      <div className="file-item">
                        <span className="file-icon">📄</span>
                        <span className="file-name">Prescription</span>
                        {patient.prescriptionUrl && (
                          <a 
                            href={patient.prescriptionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-btn"
                          >
                            View
                          </a>
                        )}
                      </div>
                      
                      <div className="file-item">
                        <span className="file-icon">🖼️</span>
                        <span className="file-name">MRI</span>
                        {patient.mriExists ? (
                          patient.mriUrl ? (
                            <a 
                              href={patient.mriUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              View
                            </a>
                          ) : (
                            <span className="no-file">Not uploaded</span>
                          )
                        ) : (
                          <span className="no-file">N/A</span>
                        )}
                      </div>
                      
                      <div className="file-item">
                        <span className="file-icon">📷</span>
                        <span className="file-name">X-Ray</span>
                        {patient.xrayExists ? (
                          patient.xrayUrl ? (
                            <a 
                              href={patient.xrayUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              View
                            </a>
                          ) : (
                            <span className="no-file">Not uploaded</span>
                          )
                        ) : (
                          <span className="no-file">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {patient.additionalNotes && (
                    <div className="notes-section">
                      <h4>Additional Notes</h4>
                      <p>{patient.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 