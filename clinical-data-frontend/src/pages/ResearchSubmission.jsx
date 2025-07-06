import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import { RewardService } from "../services/RewardService";
import "./ResearchSubmission.css";

export default function ResearchSubmission() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    researchTitle: "",
    diseaseFocus: "",
    researchAbstract: "",
    methodology: "",
    findings: "",
    conclusions: "",
    researchFile: null,
    supportingDocuments: [],
    patientCaseIds: [], // References to patient cases this research is based on
    publicationStatus: "unpublished", // unpublished, submitted, published
    journalName: "",
    doi: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

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
  }, [connected, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      if (name === "supportingDocuments") {
        setFormData(prev => ({
          ...prev,
          [name]: Array.from(files)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: files[0]
        }));
      }
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
    
    if (!formData.researchTitle.trim()) {
      newErrors.researchTitle = "Research title is required";
    }
    
    if (!formData.diseaseFocus.trim()) {
      newErrors.diseaseFocus = "Disease focus is required";
    }
    
    if (!formData.researchAbstract.trim()) {
      newErrors.researchAbstract = "Research abstract is required";
    }
    
    if (!formData.methodology.trim()) {
      newErrors.methodology = "Methodology is required";
    }
    
    if (!formData.findings.trim()) {
      newErrors.findings = "Findings are required";
    }
    
    if (!formData.conclusions.trim()) {
      newErrors.conclusions = "Conclusions are required";
    }
    
    if (!formData.researchFile) {
      newErrors.researchFile = "Research document is required";
    } else if (formData.researchFile.size > 25 * 1024 * 1024) { // 25MB limit for research documents
      newErrors.researchFile = "File size must be less than 25MB";
    }
    
    // Check supporting documents size
    if (formData.supportingDocuments.length > 0) {
      for (let i = 0; i < formData.supportingDocuments.length; i++) {
        const file = formData.supportingDocuments[i];
        if (file.size > 20 * 1024 * 1024) { // 20MB limit for supporting documents
          newErrors.supportingDocuments = `File "${file.name}" is too large. Each file must be less than 20MB`;
          break;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, path, retryCount = 0) => {
    if (!file) return null;
    
    const maxRetries = 2;
    
    try {
      const storageRef = ref(storage, path);
      
      // Add metadata to help with upload
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          fileName: file.name
        }
      };
      
      // Add timeout to prevent stuck uploads - increased to 2 minutes for larger files
      const uploadPromise = uploadBytes(storageRef, file, metadata);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - please check your internet connection and try again')), 120000) // 2 minute timeout
      );
      
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log(`File uploaded successfully: ${path}`);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file ${path} (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for certain errors
      if (retryCount < maxRetries && (
        error.message.includes('timeout') || 
        error.code === 'storage/retry-limit-exceeded' ||
        error.code === 'storage/network-request-failed'
      )) {
        console.log(`Retrying upload for ${file.name} (attempt ${retryCount + 2})...`);
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return uploadFile(file, path, retryCount + 1);
      }
      
      // Provide more specific error messages
      if (error.message.includes('timeout')) {
        throw new Error(`Upload timeout for ${file.name}. Please check your internet connection and try again.`);
      } else if (error.code === 'storage/unauthorized') {
        throw new Error(`Upload failed: Unauthorized. Please try again.`);
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error(`Upload failed: Storage quota exceeded. Please contact support.`);
      } else if (error.code === 'storage/retry-limit-exceeded') {
        throw new Error(`Upload failed: Too many retries. Please check your connection and try again.`);
      } else if (error.code === 'storage/network-request-failed') {
        throw new Error(`Upload failed: Network error. Please check your internet connection and try again.`);
      } else {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setUploadProgress({ research: 0, supporting: 0 });

    try {
      const uploads = {};
      
      // Upload main research document
      if (formData.researchFile) {
        setUploadProgress(prev => ({ ...prev, research: 10 }));
        console.log("Starting research document upload...");
        
        try {
          uploads.researchUrl = await uploadFile(
            formData.researchFile,
            `research/${currentUser.address}/${Date.now()}_research.pdf`
          );
          setUploadProgress(prev => ({ ...prev, research: 100 }));
          console.log("Research document upload completed");
        } catch (error) {
          console.error("Research document upload failed:", error);
          throw error;
        }
      }

      // Upload supporting documents
      if (formData.supportingDocuments.length > 0) {
        setUploadProgress(prev => ({ ...prev, supporting: 10 }));
        console.log("Starting supporting documents upload...");
        
        try {
          const supportingUrls = [];
          
          for (let i = 0; i < formData.supportingDocuments.length; i++) {
            const file = formData.supportingDocuments[i];
            const url = await uploadFile(
              file,
              `research/${currentUser.address}/supporting_${Date.now()}_${i}.pdf`
            );
            supportingUrls.push(url);
            
            // Update progress for each file
            const progress = 10 + ((i + 1) / formData.supportingDocuments.length) * 80;
            setUploadProgress(prev => ({ ...prev, supporting: progress }));
          }
          
          uploads.supportingUrls = supportingUrls;
          setUploadProgress(prev => ({ ...prev, supporting: 100 }));
          console.log("Supporting documents upload completed");
        } catch (error) {
          console.error("Supporting documents upload failed:", error);
          throw error;
        }
      }

      console.log("All files uploaded, saving to Firestore...");

      // Save research data to Firestore
      const researchRef = doc(db, "research", `${currentUser.address}_${Date.now()}`);
      const researchData = {
        researcherId: currentUser.address,
        researchTitle: formData.researchTitle,
        diseaseFocus: formData.diseaseFocus,
        researchAbstract: formData.researchAbstract,
        methodology: formData.methodology,
        findings: formData.findings,
        conclusions: formData.conclusions,
        researchUrl: uploads.researchUrl,
        supportingUrls: uploads.supportingUrls || [],
        patientCaseIds: formData.patientCaseIds,
        publicationStatus: formData.publicationStatus,
        journalName: formData.journalName || null,
        doi: formData.doi || null,
        submittedAt: serverTimestamp(),
        status: "pending", // pending, approved, rejected
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
      };

      await setDoc(researchRef, researchData);
      console.log("Research data saved to Firestore");
      
      // Initialize reward service and mark professional as eligible for reward
      try {
        const rewardService = new RewardService();
        const rewardResult = await rewardService.rewardProfessionalForResearch(
          currentUser.address,
          {
            researchId: researchRef.id,
            researchTitle: formData.researchTitle,
            diseaseFocus: formData.diseaseFocus
          }
        );
        
        if (rewardResult.success) {
          alert("Research submitted successfully! You will receive 0.2 APT once your research is approved.");
        } else {
          alert("Research submitted successfully! Your research will be reviewed by the community.");
        }
      } catch (rewardError) {
        console.error("Reward service error:", rewardError);
        alert("Research submitted successfully! Your research will be reviewed by the community.");
      }
      
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error submitting research:", error);
      alert(`Failed to submit research: ${error.message}. Please try again.`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ research: 0, supporting: 0 });
    }
  };

  if (!connected || !currentUser) {
    return (
      <div className="research-submission-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to submit research.</p>
        </div>
      </div>
    );
  }

  if (currentUser.verificationStatus !== "approved") {
    return (
      <div className="research-submission-container">
        <div className="access-denied">
          <h1>Verification Required</h1>
          <p>Your account needs to be verified to submit research data.</p>
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
    <div className="research-submission-container">
      <div className="submission-header">
        <h1>Submit Research Data</h1>
        <p>Share your research findings and earn 0.2 APT for approved submissions.</p>
      </div>

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-section">
          <h2>Research Information</h2>
          
          <div className="form-group">
            <label htmlFor="researchTitle">Research Title *</label>
            <input
              type="text"
              id="researchTitle"
              name="researchTitle"
              value={formData.researchTitle}
              onChange={handleInputChange}
              placeholder="Enter your research title"
              className={errors.researchTitle ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.researchTitle && <span className="error-message">{errors.researchTitle}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="diseaseFocus">Disease Focus *</label>
            <input
              type="text"
              id="diseaseFocus"
              name="diseaseFocus"
              value={formData.diseaseFocus}
              onChange={handleInputChange}
              placeholder="e.g., Rare genetic disorders, Neurological conditions"
              className={errors.diseaseFocus ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.diseaseFocus && <span className="error-message">{errors.diseaseFocus}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="researchAbstract">Research Abstract *</label>
            <textarea
              id="researchAbstract"
              name="researchAbstract"
              value={formData.researchAbstract}
              onChange={handleInputChange}
              placeholder="Provide a brief abstract of your research..."
              rows="4"
              className={errors.researchAbstract ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.researchAbstract && <span className="error-message">{errors.researchAbstract}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Research Details</h2>
          
          <div className="form-group">
            <label htmlFor="methodology">Methodology *</label>
            <textarea
              id="methodology"
              name="methodology"
              value={formData.methodology}
              onChange={handleInputChange}
              placeholder="Describe your research methodology..."
              rows="4"
              className={errors.methodology ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.methodology && <span className="error-message">{errors.methodology}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="findings">Key Findings *</label>
            <textarea
              id="findings"
              name="findings"
              value={formData.findings}
              onChange={handleInputChange}
              placeholder="Summarize your key findings..."
              rows="4"
              className={errors.findings ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.findings && <span className="error-message">{errors.findings}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="conclusions">Conclusions *</label>
            <textarea
              id="conclusions"
              name="conclusions"
              value={formData.conclusions}
              onChange={handleInputChange}
              placeholder="What are your research conclusions?"
              rows="4"
              className={errors.conclusions ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.conclusions && <span className="error-message">{errors.conclusions}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Documents</h2>
          
          <div className="form-group">
            <label htmlFor="researchFile">Research Document *</label>
            <input
              type="file"
              id="researchFile"
              name="researchFile"
              accept=".pdf,.doc,.docx"
              onChange={handleInputChange}
              className={errors.researchFile ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.researchFile && <span className="error-message">{errors.researchFile}</span>}
            {uploadProgress.research > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress.research}%` }}
                  ></div>
                </div>
                <span>Uploading research document... {uploadProgress.research}%</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="supportingDocuments">Supporting Documents</label>
            <input
              type="file"
              id="supportingDocuments"
              name="supportingDocuments"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.supportingDocuments && <span className="error-message">{errors.supportingDocuments}</span>}
            {uploadProgress.supporting > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress.supporting}%` }}
                  ></div>
                </div>
                <span>Uploading supporting documents... {uploadProgress.supporting}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Publication Information</h2>
          
          <div className="form-group">
            <label htmlFor="publicationStatus">Publication Status</label>
            <select
              id="publicationStatus"
              name="publicationStatus"
              value={formData.publicationStatus}
              onChange={handleInputChange}
              disabled={isSubmitting}
            >
              <option value="unpublished">Unpublished</option>
              <option value="submitted">Submitted for Publication</option>
              <option value="published">Published</option>
            </select>
          </div>

          {formData.publicationStatus === "submitted" && (
            <div className="form-group">
              <label htmlFor="journalName">Journal Name</label>
              <input
                type="text"
                id="journalName"
                name="journalName"
                value={formData.journalName}
                onChange={handleInputChange}
                placeholder="Enter journal name"
                disabled={isSubmitting}
              />
            </div>
          )}

          {formData.publicationStatus === "published" && (
            <>
              <div className="form-group">
                <label htmlFor="journalName">Journal Name</label>
                <input
                  type="text"
                  id="journalName"
                  name="journalName"
                  value={formData.journalName}
                  onChange={handleInputChange}
                  placeholder="Enter journal name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label htmlFor="doi">DOI</label>
                <input
                  type="text"
                  id="doi"
                  name="doi"
                  value={formData.doi}
                  onChange={handleInputChange}
                  placeholder="Enter DOI"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
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
                Submitting...
              </span>
            ) : (
              "Submit Research"
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 