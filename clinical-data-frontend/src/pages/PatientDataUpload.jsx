import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { RewardService } from "../services/RewardService";
import PinataService from "../services/PinataService";
import "./PatientDataUpload.css";

export default function PatientDataUpload() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    age: "",
    caseDetectionDate: "",
    prescriptionPdf: null,
    mriImage: null,
    xrayImage: null,
    mriExists: "yes",
    xrayExists: "yes",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (!connected || !currentUser) {
      navigate("/login");
    }
  }, [connected, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.age) {
      newErrors.age = "Age is mandatory";
    } else if (formData.age < 0 || formData.age > 120) {
      newErrors.age = "Please enter a valid age";
    }
    
    if (!formData.caseDetectionDate) {
      newErrors.caseDetectionDate = "Case detection date is mandatory";
    }
    
    if (!formData.prescriptionPdf) {
      newErrors.prescriptionPdf = "Prescription PDF is mandatory";
    } else if (formData.prescriptionPdf.size > 10 * 1024 * 1024) { // 10MB limit
      newErrors.prescriptionPdf = "File size must be less than 10MB";
    }
    
    if (formData.mriExists === "yes" && !formData.mriImage) {
      newErrors.mriImage = "MRI image is required when MRI exists";
    } else if (formData.mriImage && formData.mriImage.size > 15 * 1024 * 1024) { // 15MB limit for images
      newErrors.mriImage = "MRI image size must be less than 15MB";
    }
    
    if (formData.xrayExists === "yes" && !formData.xrayImage) {
      newErrors.xrayImage = "X-Ray image is required when X-Ray exists";
    } else if (formData.xrayImage && formData.xrayImage.size > 15 * 1024 * 1024) { // 15MB limit for images
      newErrors.xrayImage = "X-Ray image size must be less than 15MB";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFileToPinata = async (file, fileType, retryCount = 0) => {
    if (!file) return null;
    
    const maxRetries = 2;
    
    try {
      const pinataService = new PinataService();
      const metadata = {
        userId: currentUser.address,
        fileType: fileType,
        uploadedAt: new Date().toISOString()
      };
      
      const result = await pinataService.uploadFile(file, metadata);
      
      console.log(`File uploaded to Pinata successfully: ${file.name}, CID: ${result.cid}`);
      return result;
    } catch (error) {
      console.error(`Error uploading file ${file.name} to Pinata (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (
        error.message.includes('timeout') || 
        error.message.includes('network') ||
        error.message.includes('fetch')
      )) {
        console.log(`Retrying Pinata upload for ${file.name} (attempt ${retryCount + 2})...`);
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return uploadFileToPinata(file, fileType, retryCount + 1);
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ prescription: 0, mri: 0, xray: 0 });

    try {
      const uploads = {};
      
      // Upload prescription PDF to Pinata
      if (formData.prescriptionPdf) {
        setUploadProgress(prev => ({ ...prev, prescription: 10 }));
        console.log("Starting prescription upload to Pinata...");
        
        try {
          const prescriptionResult = await uploadFileToPinata(
            formData.prescriptionPdf, 
            'prescription'
          );
          uploads.prescriptionCid = prescriptionResult.cid;
          uploads.prescriptionUrl = prescriptionResult.url;
          setUploadProgress(prev => ({ ...prev, prescription: 100 }));
          console.log("Prescription upload to Pinata completed, CID:", prescriptionResult.cid);
        } catch (error) {
          console.error("Prescription upload to Pinata failed:", error);
          throw error;
        }
      }

      // Upload MRI if exists to Pinata
      if (formData.mriExists === "yes" && formData.mriImage) {
        setUploadProgress(prev => ({ ...prev, mri: 10 }));
        console.log("Starting MRI upload to Pinata...");
        
        try {
          const mriResult = await uploadFileToPinata(
            formData.mriImage,
            'mri'
          );
          uploads.mriCid = mriResult.cid;
          uploads.mriUrl = mriResult.url;
          setUploadProgress(prev => ({ ...prev, mri: 100 }));
          console.log("MRI upload to Pinata completed, CID:", mriResult.cid);
        } catch (error) {
          console.error("MRI upload to Pinata failed:", error);
          throw error;
        }
      }

      // Upload X-Ray if exists to Pinata
      if (formData.xrayExists === "yes" && formData.xrayImage) {
        setUploadProgress(prev => ({ ...prev, xray: 10 }));
        console.log("Starting X-Ray upload to Pinata...");
        
        try {
          const xrayResult = await uploadFileToPinata(
            formData.xrayImage,
            'xray'
          );
          uploads.xrayCid = xrayResult.cid;
          uploads.xrayUrl = xrayResult.url;
          setUploadProgress(prev => ({ ...prev, xray: 100 }));
          console.log("X-Ray upload to Pinata completed, CID:", xrayResult.cid);
        } catch (error) {
          console.error("X-Ray upload to Pinata failed:", error);
          throw error;
        }
      }

      console.log("All files uploaded to Pinata, saving CIDs to Firestore...");

      // Save patient data to Firestore with Pinata CIDs
      const patientRef = doc(db, "patients", currentUser.address);
      const patientData = {
        userId: currentUser.address,
        age: parseInt(formData.age),
        caseDetectionDate: formData.caseDetectionDate,
        prescriptionCid: uploads.prescriptionCid,
        prescriptionUrl: uploads.prescriptionUrl,
        mriExists: formData.mriExists === "yes",
        mriCid: uploads.mriCid || null,
        mriUrl: uploads.mriUrl || null,
        xrayExists: formData.xrayExists === "yes",
        xrayCid: uploads.xrayCid || null,
        xrayUrl: uploads.xrayUrl || null,
        additionalNotes: formData.additionalNotes,
        uploadedAt: serverTimestamp(),
        status: "pending", // pending, verified, rejected
        verifiedBy: null,
        verifiedAt: null,
      };

      await setDoc(patientRef, patientData);
      console.log("Patient data saved to Firestore");
      
      // Update user role to Patient if not already
      const userRef = doc(db, "users", currentUser.address);
      await setDoc(userRef, { role: "Patient" }, { merge: true });
      console.log("User role updated to Patient");
      
      // Initialize reward service and mark patient as eligible for reward
      try {
        const rewardService = new RewardService();
        const rewardResult = await rewardService.rewardPatientForVerification(
          currentUser.address, 
          patientData.uploadedAt
        );
        
        if (rewardResult.success) {
          alert("Patient data uploaded to IPFS successfully! You will receive 0.1 APT once your prescription is verified by medical professionals.");
        } else {
          alert("Patient data uploaded to IPFS successfully! Your data will be reviewed by medical professionals.");
        }
      } catch (rewardError) {
        console.error("Reward service error:", rewardError);
        alert("Patient data uploaded to IPFS successfully! Your data will be reviewed by medical professionals.");
      }
      
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error uploading patient data:", error);
      alert(`Failed to upload data: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ prescription: 0, mri: 0, xray: 0 });
    }
  };

  if (!connected || !currentUser) {
    return (
      <div className="patient-upload-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to upload patient data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-upload-container">
      <div className="upload-header">
        <h1>Upload Patient Data</h1>
        <p>Please provide your medical information for review by healthcare professionals.</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
              min="0"
              max="120"
              className={errors.age ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="caseDetectionDate">Case Detection Date *</label>
            <input
              type="date"
              id="caseDetectionDate"
              name="caseDetectionDate"
              value={formData.caseDetectionDate}
              onChange={handleInputChange}
              className={errors.caseDetectionDate ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.caseDetectionDate && <span className="error-message">{errors.caseDetectionDate}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Medical Documents</h2>
          
          <div className="form-group">
            <label htmlFor="prescriptionPdf">Prescription PDF *</label>
            <input
              type="file"
              id="prescriptionPdf"
              name="prescriptionPdf"
              accept=".pdf"
              onChange={handleInputChange}
              className={errors.prescriptionPdf ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.prescriptionPdf && <span className="error-message">{errors.prescriptionPdf}</span>}
            {uploadProgress.prescription > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress.prescription}%` }}
                  ></div>
                </div>
                <span>Uploading prescription to IPFS... {uploadProgress.prescription}%</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="mriExists">Do you have MRI images?</label>
            <select
              id="mriExists"
              name="mriExists"
              value={formData.mriExists}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.mriExists === "yes" && (
            <div className="form-group">
              <label htmlFor="mriImage">MRI Image</label>
              <input
                type="file"
                id="mriImage"
                name="mriImage"
                accept="image/*"
                onChange={handleInputChange}
                className={errors.mriImage ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.mriImage && <span className="error-message">{errors.mriImage}</span>}
              {uploadProgress.mri > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress.mri}%` }}
                    ></div>
                  </div>
                  <span>Uploading MRI to IPFS... {uploadProgress.mri}%</span>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="xrayExists">Do you have X-Ray images?</label>
            <select
              id="xrayExists"
              name="xrayExists"
              value={formData.xrayExists}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {formData.xrayExists === "yes" && (
            <div className="form-group">
              <label htmlFor="xrayImage">X-Ray Image</label>
              <input
                type="file"
                id="xrayImage"
                name="xrayImage"
                accept="image/*"
                onChange={handleInputChange}
                className={errors.xrayImage ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.xrayImage && <span className="error-message">{errors.xrayImage}</span>}
              {uploadProgress.xray > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress.xray}%` }}
                    ></div>
                  </div>
                  <span>Uploading X-Ray to IPFS... {uploadProgress.xray}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any additional information about your case..."
              rows="4"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>
                <span className="loading-spinner"></span>
                Uploading...
              </span>
            ) : (
              "Upload Patient Data"
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 