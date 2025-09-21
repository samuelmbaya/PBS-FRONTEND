import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Get user data from localStorage
  const user = localStorage.getItem("user");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // If not logged in, redirect
  if (!user || !isLoggedIn) {
    // optional: avoid alert spamming on every render
    if (!sessionStorage.getItem("alertShown")) {
      alert("Try Signing Up or Logging In");
      sessionStorage.setItem("alertShown", "true");
    }
    return <Navigate to="/" replace />;
  }

  // Otherwise, show the protected children
  return children;
};

export default ProtectedRoute;
