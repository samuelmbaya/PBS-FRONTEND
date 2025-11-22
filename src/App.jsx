import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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

// Import the FaceIOProvider (create this file as per previous instructions)
import { FaceIOProvider } from './Components/FaceIOContext'; // Adjust path if needed

function App() {
  return (
    // Wrap the entire app with FaceIOProvider to make it available to all routes/components
    <FaceIOProvider publicId="your-public-id-here"> {/* Replace with your actual FaceIO Public ID */}
      <Router>
        <Routes>
          {/* Landing page set to Signup (with FaceIO integration) */}
          <Route path="/" element={<Signup />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/ProductPage" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          {/* Protected Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Protected Payment Route */}
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          {/* Protected Delivery Route */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            }
          />
          {/* Protected Orders Route */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </FaceIOProvider>
  );
}

export default App;