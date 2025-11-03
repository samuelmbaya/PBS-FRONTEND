import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ Keep your redirect logic after rendering
if (localStorage.getItem("userData")) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData.isLoggedIn) {
    window.location.href = "/ProductPage";
  }
}
