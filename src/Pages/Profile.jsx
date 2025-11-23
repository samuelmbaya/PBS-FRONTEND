import React, { createContext, useContext, useState, useEffect } from 'react';
import './Profile.css';

// Create User Context
const UserContext = createContext();

// User Provider Component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        if (storedUser && storedIsLoggedIn === 'true') {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('wishlist');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ currentUser, isAuthenticated, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Profile Component
const Profile = () => {
  const { currentUser, loading, logout } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    // Backward compatibility for 'name'
    const fullName = currentUser.name || '';
    const nameParts = fullName.split(' ');
    const firstName = currentUser.firstName || nameParts[0] || '';
    const lastName = currentUser.lastName || nameParts.slice(1).join(' ') || '';

    setFormData({
      firstName,
      lastName,
      email: currentUser.email || ''
    });
  }, [currentUser, loading]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleBackToProducts = () => {
    window.location.href = '/ProductPage';
  };

  const handleOrders = () => {
    window.location.href = '/orders';
  };

  const handleCart = () => {
    window.location.href = '/cart';
  };

  const handleWishlist = () => {
    window.location.href = '/wishlist';
  };

  const getDisplayName = () => {
    if (!currentUser) return 'User';
    const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') || currentUser.name || '';
    return fullName || (currentUser.email ? currentUser.email.split('@')[0] : 'User');
  };

  if (loading) {
    return (
      <div className="profile-fullscreen">
        <div className="profile-wrapper">
          <div className="profile-header">
            <div className="profile-logo">POWERED BY SAMUEL</div>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-fullscreen">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-logo">POWERED BY SAMUEL</div>
        </div>
        {/* Hero Section (Inspired by delivery-hero) */}
        <div className="profile-hero">
          <div className="profile-hero-content">
            <h1 className="profile-hero-title">Your Profile</h1>
            <p className="profile-hero-subtitle">See More About You</p>
          </div>
        </div>
        {/* Profile Container */}
        <div className="profile-container">
          {/* Profile Section */}
          <div className="profile-section">
            <h2 className="section-title">Account Details</h2>
            <div className="greeting">Hi, {getDisplayName()}</div>
            <form className="profile-form">
              <div className="form-row">
                <div className="form-section">
                  <label htmlFor="firstName" className="form-label">First Name*</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    disabled
                    required
                  />
                </div>
                <div className="form-section">
                  <label htmlFor="lastName" className="form-label">Last Name*</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    disabled
                    required
                  />
                </div>
              </div>
              <div className="form-section">
                <label htmlFor="email" className="form-label">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  required
                />
                <button type="button" onClick={handleLogout} className="logout-btn" style={{ marginTop: '16px', width: '100%' }}>
                  Log Out
                </button>
              </div>
            </form>
          </div>
          {/* Account Actions Sidebar (Now populated) */}
          <div className="account-actions">
            <h3>Quick Actions</h3>
            <div className="action-card" onClick={handleOrders}>
              <div className="action-icon">O</div>
              <div className="action-content">
                <h4>Your Orders</h4>
                <p>Track, return, or buy things again</p>
              </div>
            </div>
            <div className="action-card" onClick={handleCart}>
              <div className="action-icon">C</div>
              <div className="action-content">
                <h4>Cart</h4>
                <p>Review items in your cart</p>
              </div>
            </div>
            <div className="action-card" onClick={handleWishlist}>
              <div className="action-icon">W</div>
              <div className="action-content">
                <h4>Wishlist</h4>
                <p>View saved items</p>
              </div>
            </div>
            <div className="action-card" onClick={handleBackToProducts}>
              <div className="action-icon">P</div>
              <div className="action-content">
                <h4>Products</h4>
                <p>Continue shopping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap Profile with UserProvider
const App = () => (
  <UserProvider>
    <Profile />
  </UserProvider>
);

export default App;