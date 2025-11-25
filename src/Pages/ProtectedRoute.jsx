import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // Get user data from localStorage
  const user = localStorage.getItem("user");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // If not logged in, redirect to login (better UX than root)
  if (!user || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, show the protected children
  return children;
};

export default ProtectedRoute;