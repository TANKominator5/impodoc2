// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function will be called when a user connects their wallet
  const handleUserConnect = async (account) => {
    if (!account || !account.address) return;
    setLoading(true);

    const userAddress = account.address.toString();
    const userRef = doc(db, "users", userAddress);
    
    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists, fetch their data
        console.log("Existing user found:", userSnap.data());
        setCurrentUser({ address: userAddress, ...userSnap.data() });
      } else {
        // New user, create a profile for them
        console.log("New user, creating profile...");
        const newUser = {
          name: "Anonymous User", // A default name
          createdAt: serverTimestamp(),
          // You can add more default fields here
        };
        await setDoc(userRef, newUser);
        setCurrentUser({ address: userAddress, ...newUser });
      }
    } catch (error) {
      console.error("Error handling user connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    // We can add wallet disconnect logic here if needed
  };

  const value = {
    currentUser,
    loading,
    handleUserConnect,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};