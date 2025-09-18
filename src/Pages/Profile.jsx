import React, { createContext, useContext, useState, useEffect } from 'react';
import './Profile.css';

// Create User Context
const UserContext = createContext();

// User Provider Component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('dark'); // default theme

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

        if (storedUser && storedIsLoggedIn === 'true') {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);

          // Load user's preferred theme from localStorage
          const userTheme = localStorage.getItem(`darkMode_${parsedUser.email}`);
          if (userTheme !== null) {
            setTheme(JSON.parse(userTheme) ? 'dark' : 'light');
          } else if (parsedUser.theme) {
            setTheme(parsedUser.theme);
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data and reset states
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('wishlist');
        setCurrentUser(null);
        setIsAuthenticated(false);
        setTheme('dark');
      }
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setTheme('dark');
  };

  return (
    <UserContext.Provider value={{ currentUser, isAuthenticated, logout, theme }}>
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
  const { currentUser, logout, theme } = useUser();

  const handleLogout = () => {
    logout();
    window.location.href = '/Home'; // you may consider using react-router's navigate for SPA navigation
  };

  const handleBackToProducts = () => {
    window.location.href = '/ProductPage'; // same as above, SPA navigation recommended
  };

  const getDisplayName = () => {
    if (!currentUser) return 'User';
    if (currentUser.name) return currentUser.name;
    if (currentUser.email) return currentUser.email.split('@')[0];
    return 'User';
  };

  return (
    <div className={`profile-container ${theme}-theme`}>
      {/* Header */}
      <div className="profile-header">
        <button className="back-to-products-btn" onClick={handleBackToProducts}>
          Back to Products
        </button>
        <span className="profile-title">PROFILE</span>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        <div className="greeting">HI, {getDisplayName().toUpperCase()}</div>

        <div className="user-info-display">
          <p>
            <strong>Name:</strong> {currentUser?.name || 'Not provided'}
          </p>
          <p>
            <strong>Email:</strong> {currentUser?.email || 'Not provided'}
          </p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          LOG OUT
        </button>
      </div>
    </div>
  );
};

// Wrap Profile with UserProvider in App
const App = () => (
  <UserProvider>
    <Profile />
  </UserProvider>
);

export default App;
