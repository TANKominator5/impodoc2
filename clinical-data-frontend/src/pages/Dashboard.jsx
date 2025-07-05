// src/pages/Dashboard.jsx
import React, { useState } from "react";
import PrivateNavbar from "../components/PrivateNavbar";
import "./Dashboard.css";
import defaultPfp from "../assets/default-pfp.png"; // 🟢 Add a placeholder image
import WalletConnect from '../components/WalletConnect';

<WalletConnect onConnectSuccess={() => console.log('Wallet Connected!')} />


export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <PrivateNavbar onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="close-sidebar" onClick={() => setMenuOpen(false)}>×</button>
        <ul>
          <li><button className="menu-btn">Profile</button></li>
          <li><button className="menu-btn">Cases</button></li>
          <li><button className="menu-btn">My Winnings</button></li>
          <li><button className="menu-btn">Contact Us</button></li>
        </ul>
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-pfp">
          <img src={defaultPfp} alt="User" />
        </div>
        <div className="profile-name">User Name</div>
      </div>

      <div className="dashboard-content">
        <h1>Welcome to Impodoc</h1>
        <p>This is your dashboard after login.</p>
      </div>
    </div>
  );
}
