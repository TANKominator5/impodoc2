// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
import RewardInfo from "../components/RewardInfo";
import "./Dashboard.css";
import defaultPfp from "../assets/default-pfp.png";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Make sure you have this exported from your firebase.js
import { useNavigate } from "react-router-dom";

// Helper to truncate wallet addresses
const truncateHex = (hex, length = 6) => {
  if (!hex) return "";
  return `${hex.slice(0, length + 2)}...${hex.slice(-4)}`;
};

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

const infoLabel = {
  color: "#94a3b8",
  fontWeight: 500,
  marginRight: 8,
};

const badgeStyle = {
  background: "linear-gradient(90deg, #6366f1 60%, #0ea5e9 100%)",
  color: "#fff",
  borderRadius: "8px",
  padding: "0.18em 0.9em",
  marginRight: 8,
  fontWeight: 600,
  fontSize: "1em",
  display: "inline-block",
  boxShadow: "0 2px 8px 0 rgba(99,102,241,0.10)",
};

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, loading, isFirstTimeUser } = useAuth();
  const { connected } = useWallet();
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  // Redirect first-time users to My Account page
  useEffect(() => {
    if (!loading && isFirstTimeUser && connected) {
      navigate("/my-account");
    }
  }, [loading, isFirstTimeUser, connected, navigate]);

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setUserData(null);
        setFetching(false);
        return;
      }
      setFetching(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setUserData(null);
        }
      } catch (err) {
        setUserData(null);
      }
      setFetching(false);
    };
    if (currentUser) fetchUserData();
    else setFetching(false);
  }, [currentUser]);

  if (loading || fetching) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading your Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!connected && !currentUser) {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h1>Access Denied</h1>
          <p>Please connect your wallet to view the dashboard.</p>
        </div>
      </div>
    );
  }

  // Use Firebase data if available, fallback to AuthContext
  const user = userData || currentUser || {};
  const role = user.role || "Explorer";
  const isDoctor = role === "Doctor";
  const isResearcher = role === "Researcher";
  const isExplorer = role === "Explorer";

  // Doctor-specific
  const doctorInfo = {
    specialization: user.specialization || "Dermatology",
    licenseNumber: user.licenseNumber || "MD-123456",
    yearsExperience: user.yearsExperience || 12,
    affiliation: user.affiliation || "St. Mary's Hospital",
    verified: user.verified || false,
    publications: user.publications || [],
    linkedin: user.linkedin || "",
    website: user.website || "",
    languages: user.languages || ["English", "Spanish"],
  };

  // Researcher-specific
  const researcherInfo = {
    field: user.field || "Neuroscience",
    institution: user.institution || "MIT",
    orcid: user.orcid || "0000-0002-1825-0097",
    scopus: user.scopus || "",
    researchgate: user.researchgate || "",
    papers: user.papers || [],
    researchFocus: user.researchFocus || "Neurodegenerative diseases",
    conferences: user.conferences || [],
  };

  // Explorer-specific
  const explorerInfo = {
    interests: user.interests || ["Rare Diseases", "Mental Health"],
    ageRange: user.ageRange || "25-34",
    preferredLanguage: user.preferredLanguage || "English",
    activityLevel: user.activityLevel || "Reader",
    bookmarks: user.bookmarks || [],
    subscribedTopics: user.subscribedTopics || ["Genetics", "Pediatrics"],
  };

  // Contributions & Activity
  const contributions = {
    uploads: user.uploads || [],
    comments: user.comments || [],
    reviews: user.reviews || [],
    saved: user.saved || [],
    topicsFollowed: user.topicsFollowed || ["Oncology", "Neurology"],
    badges: user.badges || ["Top Contributor"],
  };

  return (
    <div className="dashboard-container">
      <PrivateNavbar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <ul>
          <li><button className="menu-btn">Profile</button></li>
          <li><button className="menu-btn">Cases</button></li>
          <li><button className="menu-btn">Contributions</button></li>
          <li><button className="menu-btn">Contact Us</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <img
              src={user.photoURL || defaultPfp}
              alt="User"
              className="avatar-image"
            />
            {isDoctor && doctorInfo.verified && (
              <div className="verified-badge">✓</div>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user.name || "Full Name"}</h1>
            <div className="profile-role">
              <span className="role-badge">{role}</span>
              {isDoctor && doctorInfo.verified && (
                <span className="verified-text">Verified</span>
              )}
            </div>
            <p className="profile-bio">{user.bio || "Bio/Short Description"}</p>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span>{user.location || "City, Country"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <span>{user.email || "Email not provided"}</span>
              </div>
              {user.phone && (
                <div className="detail-item">
                  <span className="detail-icon">📞</span>
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-icon">🦊</span>
                <span className="wallet-address">
                  {user.address ? truncateHex(user.address) : "No wallet connected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based Actions */}
        <div className="role-actions">
          {role === "Patient" && (
            <div className="action-card">
              <div className="action-icon">📤</div>
              <div className="action-content">
                <h3>Upload Patient Data</h3>
                <p>Share your medical information for research and analysis</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/upload-patient-data")}
                >
                  Upload Data
                </button>
              </div>
            </div>
          )}

          {(role === "Doctor" || role === "Researcher") && (
            <>
              {user.verificationStatus !== "approved" ? (
                <div className="action-card">
                  <div className="action-icon">🔐</div>
                  <div className="action-content">
                    <h3>Verification Required</h3>
                    <p>Submit your credentials to access patient data</p>
                    <button 
                      className="action-btn"
                      onClick={() => navigate("/verification")}
                    >
                      Submit Verification
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="action-card">
                    <div className="action-icon">👥</div>
                    <div className="action-content">
                      <h3>View Patient Data</h3>
                      <p>Access and analyze patient cases for research</p>
                      <button 
                        className="action-btn"
                        onClick={() => navigate("/patient-data")}
                      >
                        View Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="action-card">
                    <div className="action-icon">🔬</div>
                    <div className="action-content">
                      <h3>Submit Research</h3>
                      <p>Share your research findings and earn 0.2 APT</p>
                      <button 
                        className="action-btn"
                        onClick={() => navigate("/research-submission")}
                      >
                        Submit Research
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Reward Information */}
        <RewardInfo />

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Basic Information Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Basic Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <span>{user.name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Role</label>
                  <span>{role}</span>
                </div>
                <div className="info-item">
                  <label>Bio</label>
                  <span>{user.bio || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <span>{user.location || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{user.email || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{user.phone || "Private"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Information Card */}
          {isDoctor && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Doctor Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Specialization</label>
                    <span>{doctorInfo.specialization}</span>
                  </div>
                  <div className="info-item">
                    <label>Medical License</label>
                    <span className="license-number">{doctorInfo.licenseNumber}</span>
                  </div>
                  <div className="info-item">
                    <label>Years of Experience</label>
                    <span>{doctorInfo.yearsExperience}</span>
                  </div>
                  <div className="info-item">
                    <label>Affiliation</label>
                    <span>{doctorInfo.affiliation}</span>
                  </div>
                  <div className="info-item">
                    <label>Languages</label>
                    <span>{doctorInfo.languages.join(", ")}</span>
                  </div>
                  {(doctorInfo.linkedin || doctorInfo.website) && (
                    <div className="info-item">
                      <label>Links</label>
                      <div className="link-buttons">
                        {doctorInfo.linkedin && (
                          <a href={doctorInfo.linkedin} target="_blank" rel="noopener noreferrer" className="link-btn">
                            LinkedIn
                          </a>
                        )}
                        {doctorInfo.website && (
                          <a href={doctorInfo.website} target="_blank" rel="noopener noreferrer" className="link-btn">
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {doctorInfo.publications.length > 0 && (
                  <div className="section-divider">
                    <h4>Publications</h4>
                    <ul className="publication-list">
                      {doctorInfo.publications.map((pub, idx) => (
                        <li key={idx}>{pub}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Researcher Information Card */}
          {isResearcher && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Researcher Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Field of Research</label>
                    <span>{researcherInfo.field}</span>
                  </div>
                  <div className="info-item">
                    <label>Institution</label>
                    <span>{researcherInfo.institution}</span>
                  </div>
                  <div className="info-item">
                    <label>ORCID</label>
                    <span className="orcid-id">{researcherInfo.orcid}</span>
                  </div>
                  {researcherInfo.scopus && (
                    <div className="info-item">
                      <label>Scopus ID</label>
                      <span>{researcherInfo.scopus}</span>
                    </div>
                  )}
                  {researcherInfo.researchgate && (
                    <div className="info-item">
                      <label>ResearchGate</label>
                      <span>{researcherInfo.researchgate}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label>Research Focus</label>
                    <span>{researcherInfo.researchFocus}</span>
                  </div>
                </div>
                {researcherInfo.papers.length > 0 && (
                  <div className="section-divider">
                    <h4>Published Papers</h4>
                    <ul className="publication-list">
                      {researcherInfo.papers.map((paper, idx) => (
                        <li key={idx}>{paper}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {researcherInfo.conferences.length > 0 && (
                  <div className="section-divider">
                    <h4>Conferences</h4>
                    <ul className="publication-list">
                      {researcherInfo.conferences.map((conf, idx) => (
                        <li key={idx}>{conf}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Explorer Information Card */}
          {isExplorer && (
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Explorer Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Interests</label>
                    <div className="tag-list">
                      {explorerInfo.interests.map((interest, idx) => (
                        <span key={idx} className="tag">{interest}</span>
                      ))}
                    </div>
                  </div>
                  <div className="info-item">
                    <label>Age Range</label>
                    <span>{explorerInfo.ageRange}</span>
                  </div>
                  <div className="info-item">
                    <label>Preferred Language</label>
                    <span>{explorerInfo.preferredLanguage}</span>
                  </div>
                  <div className="info-item">
                    <label>Activity Level</label>
                    <span>{explorerInfo.activityLevel}</span>
                  </div>
                  <div className="info-item">
                    <label>Subscribed Topics</label>
                    <div className="tag-list">
                      {explorerInfo.subscribedTopics.map((topic, idx) => (
                        <span key={idx} className="tag">{topic}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {explorerInfo.bookmarks.length > 0 && (
                  <div className="section-divider">
                    <h4>Bookmarked Articles</h4>
                    <ul className="publication-list">
                      {explorerInfo.bookmarks.map((bookmark, idx) => (
                        <li key={idx}>{bookmark}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contributions & Activity Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Contributions & Activity</h3>
            </div>
            <div className="card-content">
              <div className="activity-grid">
                <div className="activity-item">
                  <div className="activity-icon">📄</div>
                  <div className="activity-content">
                    <h4>Uploads</h4>
                    <span className="activity-count">{contributions.uploads.length}</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">💬</div>
                  <div className="activity-content">
                    <h4>Comments</h4>
                    <span className="activity-count">{contributions.comments.length}</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">⭐</div>
                  <div className="activity-content">
                    <h4>Reviews</h4>
                    <span className="activity-count">{contributions.reviews.length}</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🔖</div>
                  <div className="activity-content">
                    <h4>Saved</h4>
                    <span className="activity-count">{contributions.saved.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="section-divider">
                <h4>Topics Followed</h4>
                <div className="tag-list">
                  {contributions.topicsFollowed.map((topic, idx) => (
                    <span key={idx} className="tag">{topic}</span>
                  ))}
                </div>
              </div>

              <div className="section-divider">
                <h4>Badges & Achievements</h4>
                <div className="badge-list">
                  {contributions.badges.length > 0 ? (
                    contributions.badges.map((badge, idx) => (
                      <span key={idx} className="badge">{badge}</span>
                    ))
                  ) : (
                    <span className="no-badges">No badges yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}