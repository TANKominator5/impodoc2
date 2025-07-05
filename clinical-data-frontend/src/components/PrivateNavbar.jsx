// src/components/PrivateNavbar.jsx
import React from "react";
import { FaBars } from "react-icons/fa";
import "./PrivateNavbar.css";

const PrivateNavbar = ({ onMenuClick, menuOpen }) => {
  return (
    <nav className="private-navbar">
      <div className="left-nav">
        {!menuOpen && (
          <button className="hamburger-btn" onClick={onMenuClick}>
            <FaBars />
          </button>
        )}
        <div className="private-logo">Impodoc</div>
      </div>
    </nav>
  );
};

export default PrivateNavbar;
