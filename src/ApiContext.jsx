import React, { createContext, useContext } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const fullUrl = new URL(window.location);
  const ipFromUrl = fullUrl.searchParams.get("ip");

  // If ?ip= is provided → use that
  // Otherwise → fallback to .env
  const apiUrl = ipFromUrl
    ? `http://${ipFromUrl}:3000`
    : import.meta.env.VITE_API_URL;

  return (
    <ApiContext.Provider value={apiUrl}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiUrl = () => useContext(ApiContext);
