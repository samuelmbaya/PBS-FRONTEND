import React, { createContext, useContext } from "react";

// Create Context
const ApiContext = createContext();

// Provider Component
export const ApiProvider = ({ children }) => {
  const fullUrl = new URL(window.location);
  const apiUrl = `http://${fullUrl.searchParams.get("ip")}:3000`;

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook
export const useApiUrl = () => useContext(ApiContext);
