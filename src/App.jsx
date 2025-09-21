import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

import NotFound from "./404Page";
import ProductPage from "./Pages/ProductPage";
import ProtectedRoute from "./Pages/ProtectedRoute";
import Home from "./Pages/Home";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Delivery from "./Pages/Delivery";
import Payment from "./Pages/Payment";
import Profile from "./Pages/Profile";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Orders from "./Pages/Orders";

function App() {
  const navigate = useNavigate();

  // ✅ Auto-redirect if logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/ProductPage");
    }
  }, [navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* ProductPage should be protected */}
      <Route
        path="/ProductPage"
        element={
          <ProtectedRoute>
            <ProductPage />
          </ProtectedRoute>
        }
      />

      <Route path="/cart" element={<Cart />} />

      {/* Protected routes */}
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery"
        element={
          <ProtectedRoute>
            <Delivery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// ✅ Wrap App in Router here
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
