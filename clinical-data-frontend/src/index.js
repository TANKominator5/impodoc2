import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// 1. Import the Ant Design CSS for the wallet adapter
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

// 2. Import multiple wallet plugins to give users more options
import { PetraWallet } from "petra-plugin-wallet-adapter";

// Add any other wallets you want to support

import { AuthProvider } from "./context/AuthContext";

// 3. Add the imported wallets to the wallets array
const wallets = [
  new PetraWallet(),
];

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect={false} /* autoConnect is recommended to be true for better UX */
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);