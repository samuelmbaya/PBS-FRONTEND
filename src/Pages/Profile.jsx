import React, { createContext, useContext, useState, useEffect } from 'react';
import './Profile.css';

// Create User Context
const UserContext = createContext();

// User Provider Component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    <UserContext.Provider value={{ currentUser, isAuthenticated, logout, updateUser }}>
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
  const { currentUser, logout, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        postalCode: currentUser.postalCode || ''
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleBackToProducts = () => {
    window.location.href = '/ProductPage';
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

  if (!currentUser) {
    return (
      <div className="profile-fullscreen">
        <div className="profile-wrapper">
          <div className="profile-header">
            <div className="profile-logo">POWERED BY SAMUEL</div>
          </div>
          <div className="login-prompt">
            <h2>Not Logged In</h2>
            <p>Please log in to view your profile</p>
            <button className="login-button" onClick={() => window.location.href = '/login'}>
              Log In
            </button>
          </div>
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

        {/* Breadcrumb */}
        <div className="profile-breadcrumb">
          <span className="breadcrumb-item" onClick={handleBackToProducts} style={{ cursor: 'pointer' }}>
            Products
          </span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Profile</span>
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
                <>
                  <button type="button" onClick={() => setIsEditing(true)} className="edit-profile-btn">
                    Edit Profile
                  </button>
                  <button type="button" onClick={handleBackToProducts} className="secondary-btn">
                    Continue Shopping
                  </button>
                  <button type="button" onClick={handleLogout} className="logout-btn">
                    Log Out
                  </button>
                </>
              )}
            </form>
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