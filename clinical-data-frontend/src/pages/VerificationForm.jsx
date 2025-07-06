import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./VerificationForm.css";

export default function VerificationForm() {
  const { currentUser } = useAuth();
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    role: "Doctor",
    nmrNumber: "",
    uidNumber: "",
    specialization: "",
    institution: "",
    yearsExperience: "",
    licenseNumber: "",
    additionalCredentials: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!connected || !currentUser) {
      navigate("/login");
    }
  }, [connected, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.nmrNumber.trim()) {
      newErrors.nmrNumber = "NMR number is mandatory";
    }
    
    if (!formData.uidNumber.trim()) {
      newErrors.uidNumber = "UID number is mandatory";
    }
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }
    
    if (!formData.institution.trim()) {
      newErrors.institution = "Institution is required";
    }
    
    if (!formData.yearsExperience) {
      newErrors.yearsExperience = "Years of experience is required";
    } else if (formData.yearsExperience < 0 || formData.yearsExperience > 50) {
      newErrors.yearsExperience = "Please enter a valid number of years";
    }
    
    if (formData.role === "Doctor" && !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "Medical license number is required for doctors";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save verification request to Firestore
      const verificationRef = doc(db, "verifications", currentUser.address);
      const verificationData = {
        userId: currentUser.address,
        role: formData.role,
        nmrNumber: formData.nmrNumber,
        uidNumber: formData.uidNumber,
        specialization: formData.specialization,
        institution: formData.institution,
        yearsExperience: parseInt(formData.yearsExperience),
        licenseNumber: formData.licenseNumber || null,
        additionalCredentials: formData.additionalCredentials,
        status: "pending", // pending, approved, rejected
        submittedAt: serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
      };

      await setDoc(verificationRef, verificationData);
      
      // Update user role in users collection
      const userRef = doc(db, "users", currentUser.address);
      await setDoc(userRef, { 
        role: formData.role,
        verificationStatus: "pending"
      }, { merge: true });
      
      alert("Verification request submitted successfully! Your credentials will be reviewed by our team.");
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error submitting verification:", error);
      alert("Failed to submit verification request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected || !currentUser) {
    return (
      <div className="verification-container">
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>Please connect your wallet to submit verification.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="verification-header">
        <h1>Professional Verification</h1>
        <p>Submit your credentials for verification to access patient data and contribute to the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="verification-form">
        <div className="form-section">
          <h2>Professional Information</h2>
          
          <div className="form-group">
            <label htmlFor="role">Professional Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={errors.role ? "error" : ""}
            >
              <option value="Doctor">Doctor</option>
              <option value="Researcher">Researcher</option>
            </select>
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nmrNumber">National Medical Register (NMR) Number *</label>
            <input
              type="text"
              id="nmrNumber"
              name="nmrNumber"
              value={formData.nmrNumber}
              onChange={handleInputChange}
              placeholder="Enter your NMR number"
              className={errors.nmrNumber ? "error" : ""}
            />
            {errors.nmrNumber && <span className="error-message">{errors.nmrNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="uidNumber">UID Number *</label>
            <input
              type="text"
              id="uidNumber"
              name="uidNumber"
              value={formData.uidNumber}
              onChange={handleInputChange}
              placeholder="Enter your UID number"
              className={errors.uidNumber ? "error" : ""}
            />
            {errors.uidNumber && <span className="error-message">{errors.uidNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization/Field *</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder={formData.role === "Doctor" ? "e.g., Cardiology, Neurology" : "e.g., Neuroscience, Genetics"}
              className={errors.specialization ? "error" : ""}
            />
            {errors.specialization && <span className="error-message">{errors.specialization}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="institution">Institution/Hospital *</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              placeholder="Enter your institution name"
              className={errors.institution ? "error" : ""}
            />
            {errors.institution && <span className="error-message">{errors.institution}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="yearsExperience">Years of Experience *</label>
            <input
              type="number"
              id="yearsExperience"
              name="yearsExperience"
              value={formData.yearsExperience}
              onChange={handleInputChange}
              placeholder="Enter years of experience"
              min="0"
              max="50"
              className={errors.yearsExperience ? "error" : ""}
            />
            {errors.yearsExperience && <span className="error-message">{errors.yearsExperience}</span>}
          </div>

          {formData.role === "Doctor" && (
            <div className="form-group">
              <label htmlFor="licenseNumber">Medical License Number *</label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter your medical license number"
                className={errors.licenseNumber ? "error" : ""}
              />
              {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          
          <div className="form-group">
            <label htmlFor="additionalCredentials">Additional Credentials</label>
            <textarea
              id="additionalCredentials"
              name="additionalCredentials"
              value={formData.additionalCredentials}
              onChange={handleInputChange}
              placeholder="Any additional certifications, publications, or relevant information..."
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Verification Process</h2>
          <div className="verification-info">
            <div className="info-item">
              <div className="info-icon">📋</div>
              <div className="info-content">
                <h4>Submit Application</h4>
                <p>Your credentials will be reviewed by our verification team</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">🔍</div>
              <div className="info-content">
                <h4>Background Check</h4>
                <p>We verify your NMR and UID details with official databases</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">✅</div>
              <div className="info-content">
                <h4>Approval</h4>
                <p>Once verified, you'll have access to patient data and can contribute</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Verification Request"}
          </button>
        </div>
      </form>
    </div>
  );
} 