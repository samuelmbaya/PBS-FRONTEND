import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ApiProvider } from "./ApiContext.jsx"; // ✅ import ApiProvider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApiProvider>
      <App />
    </ApiProvider>
  </StrictMode>
);

// ✅ Keep your redirect logic after rendering
if (localStorage.getItem("userData")) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (userData.isLoggedIn) {
    window.location.href = "/ProductPage";
  }
}
