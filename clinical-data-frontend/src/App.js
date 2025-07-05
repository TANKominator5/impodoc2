// src/App.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import Navbar from "./components/Navbar";
import "./App.css";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";

const wallets = [new PetraWallet()];

function App() {
  const location = useLocation();

  // ✅ Check if current path starts with "/dashboard"
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
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <div className="app-wrapper">
        {/* ✅ Only show Navbar on public routes */}
        {!isDashboard && <Navbar />}
        <AppRoutes />
      </div>
    </AptosWalletAdapterProvider>
  );
}

export default App;
