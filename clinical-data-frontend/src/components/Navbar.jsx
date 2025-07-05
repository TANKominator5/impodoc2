// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalletModal from "./WalletModal";
import "./Navbar.css";

const Navbar = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">Impodoc</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li>
            <button onClick={() => setShowModal(true)}>Sign Up</button>
          </li>
        </ul>
      </nav>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Navbar;
