import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalletModal from "./WalletModal";
import "./Navbar.css";

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav
        className="navbar"
        style={{
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 20,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 16px 0 rgba(80,80,120,0.09)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 2rem",
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          boxSizing: "border-box", // ✅ Important
          overflowX: "hidden"      // ✅ Prevent overflow issues
        }}
        
      >
        <Link
          to="/login"
          className="logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",   // was 1.7rem — decreased
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
          
        >
          <span style={{ letterSpacing: "0.13em" }}>IMPO</span>
          <span style={{ color: "#0ea5e9" }}>DOC</span>
        </Link>

        <ul
          className="nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.7rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
            flexWrap: "wrap",
            overflow: "visible",
          }}
        >
          <li>
            <Link
              to="/login"
              style={{
                color: "#222",
                fontWeight: 500,
                fontSize: "1.08rem",
                textDecoration: "none",
                padding: "0.3em 0.7em",
                borderRadius: "7px",
                transition: "background 0.18s, color 0.18s",
              }}
              className="nav-link"
            >
              Login
            </Link>
          </li>
          <li>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "linear-gradient(90deg, #6366f1 30%, #0ea5e9 80%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.08rem",
                border: "none",
                borderRadius: "8px",
                padding: "0.45em 1.3em",
                minWidth: "110px",
                cursor: "pointer",
                boxShadow: "0 2px 8px 0 rgba(80,80,120,0.07)",
                transition: "background 0.18s, box-shadow 0.18s, transform 0.13s",
                outline: "none",
                letterSpacing: "0.03em",
              }}
              className="signup-btn"
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Sign Up
            </button>
          </li>
        </ul>
      </nav>

      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
      <div style={{ height: "4.5rem" }} />
    </>
  );
};

export default Navbar;
