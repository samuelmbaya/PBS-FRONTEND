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

  const updateUser = (updatedData) => {
    const newUserData = { ...currentUser, ...updatedData };
    setCurrentUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ currentUser, isAuthenticated, loading, logout, updateUser }}>
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
  const { currentUser, loading, logout, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    if (loading) return;

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      age: currentUser.age || '',
      gender: currentUser.gender || '',
      address: currentUser.address || '',
      city: currentUser.city || '',
      postalCode: currentUser.postalCode || ''
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
   
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Name and email are required');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    // Update user data
    updateUser(formData);
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancelEdit = () => {
    // Reset form data to current user data
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        age: currentUser.age || '',
        gender: currentUser.gender || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        postalCode: currentUser.postalCode || ''
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  const getDisplayName = () => {
    if (!currentUser) return 'User';
    if (currentUser.name) return currentUser.name;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'User';
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
            <p className="profile-hero-subtitle">Manage your account details and preferences</p>
          </div>
        </div>
        {/* Message */}
        {message && (
          <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        {/* Profile Container */}
        <div className="profile-container">
          {/* Profile Section */}
          <div className="profile-section">
            <h2 className="section-title">Account Details</h2>
            <div className="greeting">Hi, {getDisplayName()}</div>
            <form className="profile-form" onSubmit={handleSaveChanges}>
              <div className="form-section">
                <label htmlFor="name" className="form-label">Full Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-section">
                <label htmlFor="email" className="form-label">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-section">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-section">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="13"
                />
              </div>
              <div className="form-section">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-section">
                <label htmlFor="address" className="form-label">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-row">
                <div className="form-section">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-section">
                  <label htmlFor="postalCode" className="form-label">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    placeholder="Enter postal code"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing ? (
                <div className="button-group">
                  <button type="submit" className="save-changes-btn">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="non-editing-buttons">
                  <button type="button" onClick={() => setIsEditing(true)} className="edit-profile-btn">
                    Edit Profile
                  </button>
                  <button type="button" onClick={handleLogout} className="logout-btn">
                    Log Out
                  </button>
                </div>
              )}
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