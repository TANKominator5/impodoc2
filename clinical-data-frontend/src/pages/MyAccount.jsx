import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./MyAccount.css";

const gradientCard = {
  background: "linear-gradient(135deg, #1e293b 60%, #0ea5e9 100%)",
  borderRadius: "1.2rem",
  boxShadow: "0 4px 32px 0 rgba(14,165,233,0.10)",
  padding: "2rem",
  marginBottom: "2rem",
  color: "#f1f5f9",
};

const sectionTitle = {
  fontSize: "1.35rem",
  fontWeight: 700,
  marginBottom: "1.1rem",
  color: "#38bdf8",
  letterSpacing: "0.01em",
};

const formGroup = {
  marginBottom: "1.5rem",
};

const label = {
  display: "block",
  marginBottom: "0.5rem",
  color: "#94a3b8",
  fontWeight: 600,
  fontSize: "0.95rem",
};

const input = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "2px solid #334155",
  borderRadius: "0.5rem",
  backgroundColor: "#1e293b",
  color: "#f1f5f9",
  fontSize: "1rem",
  transition: "border-color 0.2s",
};

const select = {
  ...input,
  cursor: "pointer",
};

const button = {
  background: "linear-gradient(90deg, #6366f1 0%, #0ea5e9 100%)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "1.1rem",
  padding: "0.85rem 2.2rem",
  border: "none",
  borderRadius: "2rem",
  boxShadow: "0 4px 24px 0 rgba(80,80,120,0.10)",
  cursor: "pointer",
  transition: "transform 0.12s, box-shadow 0.12s",
  marginTop: "1rem",
};

const privacyNote = {
  background: "rgba(14, 165, 233, 0.1)",
  border: "1px solid #0ea5e9",
  borderRadius: "0.5rem",
  padding: "1rem",
  marginTop: "1rem",
  color: "#bae6fd",
  fontSize: "0.9rem",
};

export default function MyAccount() {
  const { currentUser, handleUserConnect } = useAuth();
  const { connected, account } = useWallet();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    role: "Explorer",
    bio: "",
    location: "",
    email: "",
    phone: "",
    interests: [],
    ageRange: "",
    preferredLanguage: "English",
    activityLevel: "Reader",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (connected && account) {
      handleUserConnect(account);
    }
  }, [connected, account, handleUserConnect]);

  useEffect(() => {
    // Check if this is a first-time user
    if (currentUser && !currentUser.name || currentUser?.name === "Anonymous User") {
      setIsFirstTime(true);
    } else if (currentUser && currentUser.name !== "Anonymous User") {
      // User already has a profile, redirect to dashboard
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

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

  const handleInterestsChange = (e) => {
    const interests = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      interests
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Display name is required";
    }
    
    if (!formData.ageRange) {
      newErrors.ageRange = "Age range is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!currentUser?.address) {
      alert("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", currentUser.address);
      
      const userData = {
        ...formData,
        address: currentUser.address,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isAnonymous: true, // Flag to maintain anonymity
        walletConnected: true,
      };

      await setDoc(userRef, userData);
      
      // Update the current user in context
      handleUserConnect(account);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(120deg, #0f172a 60%, #0ea5e9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem"
      }}>
        <div style={{ ...gradientCard, maxWidth: 500, textAlign: "center" }}>
          <h1 style={{ color: "#f43f5e", fontWeight: 800, fontSize: "2rem", marginBottom: "1rem" }}>
            Wallet Connection Required
          </h1>
          <p style={{ color: "#f1f5f9", marginBottom: "1.5rem" }}>
            Please connect your Petra wallet to continue to your account setup.
          </p>
          <button 
            onClick={() => navigate("/login")}
            style={button}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(120deg, #0f172a 60%, #0ea5e9 100%)",
      padding: "2rem"
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ ...gradientCard, textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ 
            color: "#f1f5f9", 
            fontWeight: 800, 
            fontSize: "2.5rem",
            marginBottom: "1rem"
          }}>
            Welcome to Impodoc! 👋
          </h1>
          <p style={{ 
            color: "#94a3b8", 
            fontSize: "1.1rem",
            marginBottom: "1.5rem"
          }}>
            Let's set up your anonymous profile to get started with the platform.
          </p>
          <div style={{ 
            background: "rgba(14, 165, 233, 0.1)", 
            border: "1px solid #0ea5e9", 
            borderRadius: "0.5rem", 
            padding: "1rem",
            color: "#bae6fd",
            fontSize: "0.9rem"
          }}>
            <strong>🔒 Privacy First:</strong> Your personal information is encrypted and stored anonymously. 
            Your wallet address is used only for authentication.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={gradientCard}>
          <div style={sectionTitle}>Basic Information</div>
          
          <div style={formGroup}>
            <label style={label}>
              Display Name (Anonymous) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your anonymous display name"
              style={{
                ...input,
                borderColor: errors.name ? "#ef4444" : "#334155"
              }}
              required
            />
            {errors.name && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.name}
              </div>
            )}
          </div>

          <div style={formGroup}>
            <label style={label}>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={select}
            >
              <option value="Explorer">Explorer (General User)</option>
              <option value="Doctor">Doctor</option>
              <option value="Researcher">Researcher</option>
              <option value="Patient">Patient</option>
            </select>
          </div>

          <div style={formGroup}>
            <label style={label}>Bio (Optional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself (anonymously)"
              style={{ ...input, minHeight: "100px", resize: "vertical" }}
              rows="3"
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Location (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country (optional)"
              style={input}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com (optional)"
              style={input}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 234 567 8900 (optional)"
              style={input}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Interests (Optional)</label>
            <input
              type="text"
              name="interests"
              value={formData.interests.join(', ')}
              onChange={handleInterestsChange}
              placeholder="Rare Diseases, Mental Health, Genetics (comma separated)"
              style={input}
            />
          </div>

          <div style={formGroup}>
            <label style={label}>
              Age Range <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="ageRange"
              value={formData.ageRange}
              onChange={handleInputChange}
              style={{
                ...select,
                borderColor: errors.ageRange ? "#ef4444" : "#334155"
              }}
              required
            >
              <option value="">Select age range</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-44">35-44</option>
              <option value="45-54">45-54</option>
              <option value="55-64">55-64</option>
              <option value="65+">65+</option>
            </select>
            {errors.ageRange && (
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                {errors.ageRange}
              </div>
            )}
          </div>

          <div style={formGroup}>
            <label style={label}>Preferred Language</label>
            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleInputChange}
              style={select}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={formGroup}>
            <label style={label}>Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleInputChange}
              style={select}
            >
              <option value="Reader">Reader (Mostly read content)</option>
              <option value="Contributor">Contributor (Share cases occasionally)</option>
              <option value="Active">Active (Regular contributor)</option>
              <option value="Expert">Expert (Frequent contributor)</option>
            </select>
          </div>

          <div style={privacyNote}>
            <strong>🔒 Privacy Notice:</strong> All information provided is stored anonymously and encrypted. 
            Your wallet address is only used for authentication and is not shared with other users.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...button,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Creating Profile..." : "Create My Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
