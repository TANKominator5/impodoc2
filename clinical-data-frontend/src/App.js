// src/App.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
import "./App.css";

// ❌ We REMOVED the AptosWalletAdapterProvider from here. It's already in index.js.

function App() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { connected } = useWallet();

  // Check if user is authenticated
  const isAuthenticated = connected && currentUser;
  
  // Check if current route is dashboard or other authenticated pages
  const isAuthenticatedRoute = location.pathname.startsWith("/dashboard") || 
                              location.pathname.startsWith("/upload-patient-data") ||
                              location.pathname.startsWith("/verification") ||
                              location.pathname.startsWith("/patient-data") ||
                              location.pathname.startsWith("/research-submission") ||
                              location.pathname.startsWith("/my-account");

  useEffect(() => {
    const handleMouseMove = (e) => {
      const root = document.documentElement;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      root.style.setProperty("--mouse-x", `${x}%`);
      root.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Only show Navbar for unauthenticated users or non-authenticated routes */}
      {!isAuthenticated && !isAuthenticatedRoute && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;