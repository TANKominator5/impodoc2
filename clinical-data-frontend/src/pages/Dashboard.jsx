// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
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
      <div className="dashboard-wrapper" style={{ padding: "2rem", textAlign: "center" }}>
        <div className="loader" style={{ margin: "3rem auto" }}>
          <div className="spinner" style={{
            width: 48, height: 48, border: "6px solid #38bdf8", borderTop: "6px solid #1e293b", borderRadius: "50%", animation: "spin 1s linear infinite"
          }} />
        </div>
        <div style={{ color: "#38bdf8", fontWeight: 600, fontSize: "1.2rem" }}>Loading your Dashboard...</div>
      </div>
    );
  }

  if (!connected && !currentUser) {
    return (
      <div className="dashboard-wrapper" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ ...gradientCard, maxWidth: 420, margin: "3rem auto" }}>
          <h1 style={{ color: "#f43f5e", fontWeight: 800, fontSize: "2rem" }}>Access Denied</h1>
          <p style={{ color: "#f1f5f9", marginTop: 16 }}>Please connect your wallet to view the dashboard.</p>
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
    <div className="dashboard-wrapper" style={{ background: "linear-gradient(120deg, #0f172a 60%, #0ea5e9 100%)", minHeight: "100vh" }}>
      <PrivateNavbar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setMenuOpen(false)}>
          ×
        </button>
        <ul>
          <li>
            <button className="menu-btn">Profile</button>
          </li>
          <li>
            <button className="menu-btn">Cases</button>
          </li>
          <li>
            <button className="menu-btn">Contributions</button>
          </li>
          <li>
            <button className="menu-btn">Contact Us</button>
          </li>
        </ul>
      </div>

      {/* Profile Section */}
      <div
        className="profile-section"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2.5rem",
          marginTop: "2.5rem",
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div className="profile-pfp" style={{
          boxShadow: "0 4px 24px 0 rgba(14,165,233,0.15)",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #0ea5e9 60%, #1e293b 100%)",
          padding: 6,
        }}>
          <img
            src={user.photoURL || defaultPfp}
            alt="User"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #38bdf8",
              background: "#fff",
            }}
          />
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontWeight: 800, fontSize: "2.1rem", color: "#f1f5f9" }}>
            {user.name || "Full Name"}
          </h2>
          <div style={{ fontWeight: 600, color: "#38bdf8", marginBottom: 6, fontSize: "1.1rem" }}>
            {role}
            {isDoctor && doctorInfo.verified && (
              <span style={{ marginLeft: 10, color: "#22c55e", fontWeight: 700, fontSize: "1.1rem" }}>✔ Verified</span>
            )}
          </div>
          <div style={{ color: "#cbd5e1", marginBottom: 10, fontSize: "1.05rem" }}>
            {user.bio || "Bio/Short Description"}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "1.01rem", marginBottom: 4 }}>
            <span role="img" aria-label="location">📍</span>{" "}
            {user.location || "City, Country"}
          </div>
          <div style={{ marginTop: 4, fontSize: "1.01rem", color: "#94a3b8" }}>
            <span role="img" aria-label="email">📧</span>{" "}
            {user.email || <span style={{ color: "#64748b" }}>Email not provided</span>}
            {user.phone && (
              <>
                {" "}
                | <span role="img" aria-label="phone">📞</span> {user.phone}
              </>
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: "1.01rem", color: "#94a3b8" }}>
            <span role="img" aria-label="wallet">🦊</span>{" "}
            {user.address ? <strong style={{ color: "#fbbf24" }}>{truncateHex(user.address)}</strong> : "No wallet connected"}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content" style={{ marginTop: "2.5rem", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        {/* Basic Information */}
        <div style={gradientCard}>
          <div style={sectionTitle}>Basic Information</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
              <li><span style={infoLabel}>Full Name:</span> {user.name || "N/A"}</li>
              <li><span style={infoLabel}>Role:</span> {role}</li>
              <li><span style={infoLabel}>Bio:</span> {user.bio || "N/A"}</li>
              <li><span style={infoLabel}>Location:</span> {user.location || "N/A"}</li>
              <li><span style={infoLabel}>Email:</span> {user.email || "N/A"}</li>
              <li><span style={infoLabel}>Phone:</span> {user.phone || "Private"}</li>
            </ul>
          </div>
        </div>

        {/* Doctor Section */}
        {isDoctor && (
          <div style={gradientCard}>
            <div style={sectionTitle}>Doctor Information</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li><span style={infoLabel}>Specialization:</span> {doctorInfo.specialization}</li>
              <li>
                <span style={infoLabel}>Medical License #:</span>
                <span style={{ color: "#fbbf24" }}>{doctorInfo.licenseNumber}</span>
                {doctorInfo.verified && (
                  <span style={{ color: "#22c55e", fontWeight: 700, marginLeft: 10 }}>✔ Verified</span>
                )}
              </li>
              <li><span style={infoLabel}>Years of Experience:</span> {doctorInfo.yearsExperience}</li>
              <li><span style={infoLabel}>Affiliation:</span> {doctorInfo.affiliation}</li>
              <li><span style={infoLabel}>Languages:</span> {doctorInfo.languages.join(", ")}</li>
              {doctorInfo.publications.length > 0 && (
                <li>
                  <span style={infoLabel}>Publications:</span>
                  <ul style={{ marginTop: 4, marginLeft: 12 }}>
                    {doctorInfo.publications.map((pub, idx) => (
                      <li key={idx} style={{ color: "#bae6fd" }}>{pub}</li>
                    ))}
                  </ul>
                </li>
              )}
              {(doctorInfo.linkedin || doctorInfo.website) && (
                <li>
                  <span style={infoLabel}>Links:</span>
                  {doctorInfo.linkedin && (
                    <a href={doctorInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontWeight: 600 }}>
                      LinkedIn
                    </a>
                  )}
                  {doctorInfo.website && (
                    <>
                      {" | "}
                      <a href={doctorInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", fontWeight: 600 }}>
                        Website
                      </a>
                    </>
                  )}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Researcher Section */}
        {isResearcher && (
          <div style={gradientCard}>
            <div style={sectionTitle}>Researcher Information</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li><span style={infoLabel}>Field of Research:</span> {researcherInfo.field}</li>
              <li><span style={infoLabel}>Institution:</span> {researcherInfo.institution}</li>
              <li><span style={infoLabel}>ORCID:</span> {researcherInfo.orcid}</li>
              {researcherInfo.scopus && (
                <li><span style={infoLabel}>Scopus ID:</span> {researcherInfo.scopus}</li>
              )}
              {researcherInfo.researchgate && (
                <li><span style={infoLabel}>ResearchGate:</span> {researcherInfo.researchgate}</li>
              )}
              <li><span style={infoLabel}>Current Research Focus:</span> {researcherInfo.researchFocus}</li>
              {researcherInfo.papers.length > 0 && (
                <li>
                  <span style={infoLabel}>Published Papers/Projects:</span>
                  <ul style={{ marginTop: 4, marginLeft: 12 }}>
                    {researcherInfo.papers.map((paper, idx) => (
                      <li key={idx} style={{ color: "#bae6fd" }}>{paper}</li>
                    ))}
                  </ul>
                </li>
              )}
              {researcherInfo.conferences.length > 0 && (
                <li>
                  <span style={infoLabel}>Conferences Attended/Presented:</span>
                  <ul style={{ marginTop: 4, marginLeft: 12 }}>
                    {researcherInfo.conferences.map((conf, idx) => (
                      <li key={idx} style={{ color: "#bae6fd" }}>{conf}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Explorer Section */}
        {isExplorer && (
          <div style={gradientCard}>
            <div style={sectionTitle}>Explorer Information</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li><span style={infoLabel}>Interests:</span> {explorerInfo.interests.join(", ")}</li>
              <li><span style={infoLabel}>Age Range:</span> {explorerInfo.ageRange}</li>
              <li><span style={infoLabel}>Preferred Language:</span> {explorerInfo.preferredLanguage}</li>
              <li><span style={infoLabel}>Activity Level:</span> {explorerInfo.activityLevel}</li>
              <li>
                <span style={infoLabel}>Bookmarked Articles/Cases:</span>
                {explorerInfo.bookmarks.length > 0
                  ? explorerInfo.bookmarks.map((b, idx) => (
                      <span key={idx} style={{ color: "#bae6fd" }}>
                        {b}
                        {idx < explorerInfo.bookmarks.length - 1 ? ", " : ""}
                      </span>
                    ))
                  : <span style={{ color: "#64748b" }}>None</span>}
              </li>
              <li>
                <span style={infoLabel}>Subscribed Topics:</span> {explorerInfo.subscribedTopics.join(", ")}
              </li>
            </ul>
          </div>
        )}

        {/* Contributions & Activity */}
        <div style={gradientCard}>
          <div style={sectionTitle}>Contributions & Activity</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <span style={infoLabel}>Uploaded Case Studies/Documents:</span>
              {contributions.uploads.length > 0
                ? contributions.uploads.map((u, idx) => (
                    <span key={idx} style={{ color: "#bae6fd" }}>
                      {u}
                      {idx < contributions.uploads.length - 1 ? ", " : ""}
                    </span>
                  ))
                : <span style={{ color: "#64748b" }}>None</span>}
            </li>
            <li>
              <span style={infoLabel}>Comments/Discussions:</span>
              {contributions.comments.length > 0
                ? contributions.comments.map((c, idx) => (
                    <span key={idx} style={{ color: "#bae6fd" }}>
                      {c}
                      {idx < contributions.comments.length - 1 ? ", " : ""}
                    </span>
                  ))
                : <span style={{ color: "#64748b" }}>None</span>}
            </li>
            <li>
              <span style={infoLabel}>Peer Reviews Given:</span>
              {contributions.reviews.length > 0
                ? contributions.reviews.map((r, idx) => (
                    <span key={idx} style={{ color: "#bae6fd" }}>
                      {r}
                      {idx < contributions.reviews.length - 1 ? ", " : ""}
                    </span>
                  ))
                : <span style={{ color: "#64748b" }}>None</span>}
            </li>
            <li>
              <span style={infoLabel}>Saved/Bookmarked Content:</span>
              {contributions.saved.length > 0
                ? contributions.saved.map((s, idx) => (
                    <span key={idx} style={{ color: "#bae6fd" }}>
                      {s}
                      {idx < contributions.saved.length - 1 ? ", " : ""}
                    </span>
                  ))
                : <span style={{ color: "#64748b" }}>None</span>}
            </li>
            <li>
              <span style={infoLabel}>Topics Followed:</span> {contributions.topicsFollowed.join(", ")}
            </li>
            <li>
              <span style={infoLabel}>Badges/Achievements:</span>
              {contributions.badges.length > 0
                ? contributions.badges.map((b, idx) => (
                    <span key={idx} style={badgeStyle}>
                      {b}
                    </span>
                  ))
                : <span style={{ color: "#64748b" }}>None</span>}
            </li>
          </ul>
        </div>
      </div>
      {/* Spinner animation keyframes */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}