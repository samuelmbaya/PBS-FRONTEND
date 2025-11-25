import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import NotFound from './404Page';
import ProductPage from './Pages/ProductPage';
import ProtectedRoute from './Pages/ProtectedRoute';
import Home from './Pages/Home';
import Cart from './Pages/Cart';
import Wishlist from './Pages/Wishlist';
import Delivery from './Pages/Delivery';
import Payment from './Pages/Payment';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Orders from './Pages/Orders';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page set to Home (changed from Signup for better UX; adjust if needed) */}
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ProductPage" element={<ProductPage />} />
        
        {/* Public routes - accessible to guests */}
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes - only logged-in users (added protection to /cart; removed from /delivery and /payment) */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
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
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;