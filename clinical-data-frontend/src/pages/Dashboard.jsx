// src/pages/Dashboard.jsx
import React, { useState } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
import "./Dashboard.css";
import defaultPfp from "../assets/default-pfp.png";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, loading } = useAuth();
  const { connected } = useWallet();

  // Helper to truncate wallet addresses
  const truncateHex = (hex, length = 6) => {
    if (!hex) return "";
    return `${hex.slice(0, length + 2)}...${hex.slice(-4)}`;
  };

  if (loading) {
    return <div>Loading Dashboard...</div>;
  }

  if (!connected && !currentUser) {
    return (
      <div className="dashboard-wrapper" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>Please connect your wallet to view the dashboard.</p>
      </div>
    );
  }

  // Mock/fallback data for demonstration
  const user = currentUser || {};
  const role = user.role || "Explorer"; // "Doctor", "Researcher", or "Explorer"
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
    <div className="dashboard-wrapper">
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
      <div className="profile-section" style={{ display: "flex", alignItems: "center", gap: "2rem", marginTop: "2rem" }}>
        <div className="profile-pfp">
          <img src={user.photoURL || defaultPfp} alt="User" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover" }} />
        </div>
        <div className="profile-info" style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{user.name || "Full Name"}</h2>
          <div style={{ fontWeight: 500, color: "#7dd3fc", marginBottom: 4 }}>
            {role}
            {isDoctor && doctorInfo.verified && (
              <span style={{ marginLeft: 8, color: "#22c55e", fontWeight: 700, fontSize: "1rem" }}>✔ Verified</span>
            )}
          </div>
          <div style={{ color: "#aaa", marginBottom: 8 }}>{user.bio || "Bio/Short Description"}</div>
          <div style={{ color: "#ccc", fontSize: "0.98rem" }}>
            <span role="img" aria-label="location">
              📍
            </span>{" "}
            {user.location || "City, Country"}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.97rem" }}>
            <span role="img" aria-label="email">
              📧
            </span>{" "}
            {user.email || <span style={{ color: "#666" }}>Email not provided</span>}
            {user.phone && (
              <>
                {" "}
                | <span role="img" aria-label="phone">📞</span> {user.phone}
              </>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.97rem" }}>
            <span role="img" aria-label="wallet">
              🦊
            </span>{" "}
            {user.address ? <strong>{truncateHex(user.address)}</strong> : "No wallet connected"}
          </div>
        </div>
      </div>

      {/* Role-Specific Sections */}
      <div className="dashboard-content" style={{ marginTop: "2.5rem" }}>
        <h2 style={{ marginBottom: "1.2rem" }}>Basic Information</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#e0e0e0" }}>
          <li>
            <strong>Full Name:</strong> {user.name || "N/A"}
          </li>
          <li>
            <strong>Role:</strong> {role}
          </li>
          <li>
            <strong>Bio:</strong> {user.bio || "N/A"}
          </li>
          <li>
            <strong>Location:</strong> {user.location || "N/A"}
          </li>
          <li>
            <strong>Email:</strong> {user.email || "N/A"}
          </li>
          <li>
            <strong>Phone:</strong> {user.phone || "Private"}
          </li>
        </ul>

        {/* Doctor Section */}
        {isDoctor && (
          <div style={{ marginTop: "2.5rem" }}>
            <h2>Doctor Information</h2>
            <ul style={{ listStyle: "none", padding: 0, color: "#e0e0e0" }}>
              <li>
                <strong>Specialization:</strong> {doctorInfo.specialization}
              </li>
              <li>
                <strong>Medical License #:</strong>{" "}
                <span style={{ color: "#fbbf24" }}>{doctorInfo.licenseNumber}</span>{" "}
                {doctorInfo.verified && (
                  <span style={{ color: "#22c55e", fontWeight: 700, marginLeft: 8 }}>✔ Verified</span>
                )}
              </li>
              <li>
                <strong>Years of Experience:</strong> {doctorInfo.yearsExperience}
              </li>
              <li>
                <strong>Affiliation:</strong> {doctorInfo.affiliation}
              </li>
              <li>
                <strong>Languages:</strong> {doctorInfo.languages.join(", ")}
              </li>
              {doctorInfo.publications.length > 0 && (
                <li>
                  <strong>Publications:</strong>
                  <ul>
                    {doctorInfo.publications.map((pub, idx) => (
                      <li key={idx}>{pub}</li>
                    ))}
                  </ul>
                </li>
              )}
              {(doctorInfo.linkedin || doctorInfo.website) && (
                <li>
                  <strong>Links:</strong>{" "}
                  {doctorInfo.linkedin && (
                    <a href={doctorInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
                      LinkedIn
                    </a>
                  )}
                  {doctorInfo.website && (
                    <>
                      {" | "}
                      <a href={doctorInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
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
          <div style={{ marginTop: "2.5rem" }}>
            <h2>Researcher Information</h2>
            <ul style={{ listStyle: "none", padding: 0, color: "#e0e0e0" }}>
              <li>
                <strong>Field of Research:</strong> {researcherInfo.field}
              </li>
              <li>
                <strong>Institution:</strong> {researcherInfo.institution}
              </li>
              <li>
                <strong>ORCID:</strong> {researcherInfo.orcid}
              </li>
              {researcherInfo.scopus && (
                <li>
                  <strong>Scopus ID:</strong> {researcherInfo.scopus}
                </li>
              )}
              {researcherInfo.researchgate && (
                <li>
                  <strong>ResearchGate:</strong> {researcherInfo.researchgate}
                </li>
              )}
              <li>
                <strong>Current Research Focus:</strong> {researcherInfo.researchFocus}
              </li>
              {researcherInfo.papers.length > 0 && (
                <li>
                  <strong>Published Papers/Projects:</strong>
                  <ul>
                    {researcherInfo.papers.map((paper, idx) => (
                      <li key={idx}>{paper}</li>
                    ))}
                  </ul>
                </li>
              )}
              {researcherInfo.conferences.length > 0 && (
                <li>
                  <strong>Conferences Attended/Presented:</strong>
                  <ul>
                    {researcherInfo.conferences.map((conf, idx) => (
                      <li key={idx}>{conf}</li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Explorer Section */}
        {isExplorer && (
          <div style={{ marginTop: "2.5rem" }}>
            <h2>Explorer Information</h2>
            <ul style={{ listStyle: "none", padding: 0, color: "#e0e0e0" }}>
              <li>
                <strong>Interests:</strong> {explorerInfo.interests.join(", ")}
              </li>
              <li>
                <strong>Age Range:</strong> {explorerInfo.ageRange}
              </li>
              <li>
                <strong>Preferred Language:</strong> {explorerInfo.preferredLanguage}
              </li>
              <li>
                <strong>Activity Level:</strong> {explorerInfo.activityLevel}
              </li>
              <li>
                <strong>Bookmarked Articles/Cases:</strong>{" "}
                {explorerInfo.bookmarks.length > 0
                  ? explorerInfo.bookmarks.map((b, idx) => <span key={idx}>{b}{idx < explorerInfo.bookmarks.length - 1 ? ", " : ""}</span>)
                  : "None"}
              </li>
              <li>
                <strong>Subscribed Topics:</strong> {explorerInfo.subscribedTopics.join(", ")}
              </li>
            </ul>
          </div>
        )}

        {/* Contributions & Activity */}
        <div style={{ marginTop: "2.5rem" }}>
          <h2>Contributions & Activity</h2>
          <ul style={{ listStyle: "none", padding: 0, color: "#e0e0e0" }}>
            <li>
              <strong>Uploaded Case Studies/Documents:</strong>{" "}
              {contributions.uploads.length > 0
                ? contributions.uploads.map((u, idx) => <span key={idx}>{u}{idx < contributions.uploads.length - 1 ? ", " : ""}</span>)
                : "None"}
            </li>
            <li>
              <strong>Comments/Discussions:</strong>{" "}
              {contributions.comments.length > 0
                ? contributions.comments.map((c, idx) => <span key={idx}>{c}{idx < contributions.comments.length - 1 ? ", " : ""}</span>)
                : "None"}
            </li>
            <li>
              <strong>Peer Reviews Given:</strong>{" "}
              {contributions.reviews.length > 0
                ? contributions.reviews.map((r, idx) => <span key={idx}>{r}{idx < contributions.reviews.length - 1 ? ", " : ""}</span>)
                : "None"}
            </li>
            <li>
              <strong>Saved/Bookmarked Content:</strong>{" "}
              {contributions.saved.length > 0
                ? contributions.saved.map((s, idx) => <span key={idx}>{s}{idx < contributions.saved.length - 1 ? ", " : ""}</span>)
                : "None"}
            </li>
            <li>
              <strong>Topics Followed:</strong> {contributions.topicsFollowed.join(", ")}
            </li>
            <li>
              <strong>Badges/Achievements:</strong>{" "}
              {contributions.badges.length > 0
                ? contributions.badges.map((b, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: "#6366f1",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "0.18em 0.7em",
                        marginRight: 6,
                        fontWeight: 600,
                        fontSize: "0.97em",
                        display: "inline-block",
                      }}
                    >
                      {b}
                    </span>
                  ))
                : "None"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}