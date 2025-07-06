// src/App.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
import "./App.css";

// ❌ We REMOVED the AptosWalletAdapterProvider from here. It's already in index.js.

function App() {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");

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
      {!isDashboard && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;