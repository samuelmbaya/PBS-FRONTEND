import React, { createContext, useContext } from "react";

const ApiContext = createContext();

// Provider Component
export const ApiProvider = ({ children }) => {
  const fullUrl = new URL(window.location);
  const ipFromQuery = fullUrl.searchParams.get("ip");

  // ✅ Priority:
  // 1. If ?ip= is provided → use it
  // 2. If in production → use .env.production value
  // 3. Otherwise (dev) → localhost
  const apiUrl = ipFromQuery
    ? `http://${ipFromQuery}:3000`
    : process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:3000";

  return (
    <ApiContext.Provider value={apiUrl}>{children}</ApiContext.Provider>
  );
};

// Custom hook
export const useApiUrl = () => useContext(ApiContext);
