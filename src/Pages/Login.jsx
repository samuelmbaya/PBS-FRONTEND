import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useApiUrl } from '../ApiContext'; // ✅ Import API context

const Login = () => {
  const navigate = useNavigate();
  const apiUrl = useApiUrl(); // ✅ Get dynamic API URL from context

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserGreeting, setShowUserGreeting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Check API connection status
  const checkApiConnection = async () => {
    try {
      console.log('Checking API connection to:', apiUrl);
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Health Check:', data);
        setConnectionStatus('connected');
        return true;
      } else {
        console.log('API responded with status:', response.status);
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('API Connection Error:', error);
      setConnectionStatus('error');
      setMessage('Cannot connect to server. Please check your internet connection or try again later.');
      return false;
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');

        if (storedUser && storedIsLoggedIn === 'true') {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('wishlist');
      }
    };

    checkAuthStatus();
    checkApiConnection();
  }, [apiUrl]);

  const saveUserToLocalStorage = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      // Initialize wishlist for new user if it doesn't exist
      const existingWishlist = localStorage.getItem(`wishlist_${userData.email}`);
      if (!existingWishlist) {
        localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify([]));
      }

      setCurrentUser(userData);
      setIsAuthenticated(true);

      setShowUserGreeting(true);
      setTimeout(() => setShowUserGreeting(false), 4000);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check connection before attempting login
    if (connectionStatus !== 'connected') {
      const isConnected = await checkApiConnection();
      if (!isConnected) {
        return;
      }
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('Attempting login to:', `${apiUrl}/signin`);
      console.log('Login data:', { email: loginData.username }); // Don't log password
      
      const response = await fetch(`${apiUrl}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.username.trim().toLowerCase(),
          password: loginData.password
        }),
        // Add timeout
        signal: AbortSignal.timeout(10000)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Expected JSON but got:', textResponse);
        
        // Show more specific error based on status code
        if (response.status === 404) {
          setMessage('API endpoint not found. Please check server configuration.');
        } else if (response.status === 405) {
          setMessage('Method not allowed. Please check server configuration.');
        } else {
          setMessage('Server returned unexpected response format. Please try again.');
        }
        return;
      }

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        const userDataToStore = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          loginTime: new Date().toISOString()
        };

        saveUserToLocalStorage(userDataToStore);
        setMessage('Login successful! Redirecting...');
        setLoginData({ username: '', password: '' });

        setTimeout(() => {
          navigate('/Home');
        }, 1500);
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setMessage('Invalid email or password. Please check your credentials and try again.');
        } else if (response.status === 400) {
          setMessage('Please fill in both email and password.');
        } else {
          setMessage(data.error || `Login failed (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        setMessage('Request timed out. Please check your connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('Network error. Please check your internet connection.');
      } else {
        setMessage(`Connection error: ${error.message}`);
      }
      
      // Reset connection status to trigger recheck
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToHome = () => {
    if (isAuthenticated && currentUser) {
      navigate('/ProtectedRoutez');
    } else {
      alert('You must be logged in to access this page.');
    }
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  const retryConnection = () => {
    setMessage('');
    setConnectionStatus('checking');
    checkApiConnection();
  };

  return (
    <div className="login-body">
      <div className="login-container">
        {/* Connection Status Indicator */}
        {connectionStatus !== 'connected' && (
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'checking' && (
              <div>🔍 Checking server connection...</div>
            )}
            {connectionStatus === 'error' && (
              <div>
                ❌ Cannot connect to server 
                <button onClick={retryConnection} className="retry-btn">Retry</button>
              </div>
            )}
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="connection-status connected">
            ✅ Connected to server
          </div>
        )}

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {isAuthenticated && currentUser && showUserGreeting && (
          <div className="greeting-message">
            Hi, {currentUser.name || currentUser.email}! Welcome back.
          </div>
        )}

        <div className="login-form-box">
          <div className="form-container">
            <h1>Hello Again!!!</h1>
            <form onSubmit={handleLogin}>
              <div className="input-box">
                <input 
                  type="text" 
                  name="username"
                  placeholder="Email or Username" 
                  value={loginData.username}
                  onChange={handleLoginInputChange}
                  disabled={isLoading || connectionStatus !== 'connected'}
                  required 
                />
                <i className='bx bxs-user'></i>
              </div>
              <div className="input-box">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  disabled={isLoading || connectionStatus !== 'connected'}
                  required 
                />
                <i className='bx bxs-lock-alt'></i>
              </div>
              <div className="forgot-link">
                <a href="#">Forgot Password?</a>
              </div>
              <button 
                type="submit"
                className="login-btn"
                disabled={isLoading || connectionStatus !== 'connected'}
              >
                {isLoading ? 'Logging in...' : 
                 connectionStatus !== 'connected' ? 'Server Unavailable' : 'Login'}
              </button>
            </form>

            <div className="auth-links">
              <p>Don't have an account? <button onClick={goToSignup} className="link-btn">Sign up</button></p>
              <button onClick={handleSkipToHome} className="skip-btn">
                Skip to Home
              </button>
            </div>

            <p className="social-text">or login with social platforms</p>
            <div className="social-icons">
              <a href="#"><i className='bx bxl-google'></i></a>
              <a href="#"><i className='bx bxl-facebook'></i></a>
              <a href="#"><i className='bx bxl-github'></i></a>
              <a href="#"><i className='bx bxl-linkedin'></i></a>
            </div>
          </div>
        </div>

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{ 
            marginTop: '20px', 
            padding: '10px', 
            backgroundColor: '#f0f0f0', 
            fontSize: '12px',
            borderRadius: '4px'
          }}>
            <strong>Debug Info:</strong>
            <div>API URL: {apiUrl}</div>
            <div>Connection Status: {connectionStatus}</div>
            <div>Is Authenticated: {isAuthenticated.toString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;