import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFaceIO } from "../Components/FaceIOContext"; // Adjust path to your FaceIOContext (e.g., '../../contexts/FaceIOContext')
import "./Login.css";
import ReCaptcha from "../Components/reCaptcha";

const Login = () => {
  const navigate = useNavigate();
  const { faceio, loading: fioLoading, error: fioError, handleError, setError: setFioError } = useFaceIO();
  const apiUrl = import.meta.env.VITE_API_URL || "http://44.198.25.29:3000";

  const [isLoading, setIsLoading] = useState(false);
  const [fioIsLoading, setFioIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fioMessage, setFioMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserGreeting, setShowUserGreeting] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [token, setToken] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(false);

  useEffect(() => {
    if (token.length) {
      setSubmitEnabled(true);
    }
  }, [token]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

      if (storedUser && storedIsLoggedIn === "true") {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("wishlist");
    }
  }, []);

  const saveUserToLocalStorage = (userData) => {
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");

      const existingWishlist = localStorage.getItem(`wishlist_${userData.email}`);
      if (!existingWishlist) {
        localStorage.setItem(`wishlist_${userData.email}`, JSON.stringify([]));
      }

      setCurrentUser(userData);
      setIsAuthenticated(true);
      setShowUserGreeting(true);

      setTimeout(() => setShowUserGreeting(false), 4000);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage("");
  };

  const handleRecaptcha = useCallback((token) => {
    setToken(token);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.username,
          password: loginData.password,
          token: token,
        }),
      });

      if (!response.ok) {
        let errMessage = "Login failed";
        try {
          const errorData = await response.json();
          errMessage = errorData.error || errorData.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      const userDataToStore = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        loginTime: new Date().toISOString(),
      };

      saveUserToLocalStorage(userDataToStore);
      setMessage("Login successful! Redirecting...");
      setLoginData({ username: "", password: "" });

      setTimeout(() => navigate("/Home"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // FaceIO Authentication Handler (passwordless option)
  const handleFaceLogin = async () => {
    if (fioLoading || fioIsLoading || !faceio) {
      setFioMessage("FaceIO not ready. Please wait.");
      return;
    }

    setFioIsLoading(true);
    setFioMessage("Authenticating with face...");
    setFioError(null);

    try {
      const userData = await faceio.authenticate({
        locale: "auto",
      });
      setFioMessage(`Face authenticated! Logging in as ${userData.payload.email}...`);
      
      // Use payload.email and facialId to log in via backend
      // Implement /login-face on backend to verify facialId against enrolled users and return user data
      const response = await fetch(`${apiUrl}/login-face`, { // New endpoint: POST /login-face
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.payload.email,
          facialId: userData.facialId,
        }),
      });

      if (!response.ok) {
        let errMessage = "Face login failed";
        try {
          const errorData = await response.json();
          errMessage = errorData.error || errorData.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      const userDataToStore = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        loginTime: new Date().toISOString(),
      };

      saveUserToLocalStorage(userDataToStore);
      setTimeout(() => navigate("/Home"), 1500);
    } catch (errCode) {
      if (typeof errCode === 'string' && errCode.startsWith('fioErrCode')) {
        handleError(errCode);
        setFioMessage("Face authentication failed. Try password login.");
      } else {
        console.error("Face login error:", errCode);
        setFioMessage(errCode.message || "Failed to connect to server");
      }
    } finally {
      setFioIsLoading(false);
    }
  };

  const handleSkipToHome = () => {
    if (isAuthenticated && currentUser) {
      navigate("/ProtectedRoutez");
    } else {
      setMessage("You must be logged in to access this page.");
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  // Show FaceIO-specific errors/messages
  useEffect(() => {
    if (fioError) {
      setFioMessage(fioError);
      setFioError(null);
    }
  }, [fioError, setFioError]);

  return (
    <div className="login-container">
      {/* Left Side - Background Image */}
      <div className="login-left">
        <div className="login-image-overlay"></div>
        <div className="video-overlay">
          <h2>Welcome Back</h2>
          <p>Access your account and explore premium designs.</p>
          <span>
            <strong>Powered By Samuel</strong> — Innovation you can trust.
          </span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        {message && (
          <div className={`login-message ${message.includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}
        {fioMessage && (
          <div className={`login-message ${fioMessage.includes("success") || fioMessage.includes("Welcome") ? "success" : "error"}`}>
            {fioMessage}
          </div>
        )}

        {isAuthenticated && currentUser && showUserGreeting && (
          <div className="greeting-message">
            Hi, {currentUser.name || currentUser.email}! Welcome back.
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <h2>Log in to your account</h2>

          <label htmlFor="username">Email address*</label>
          <input
            type="email"
            id="username"
            name="username"
            placeholder="Enter your email"
            value={loginData.username}
            onChange={handleLoginInputChange}
            disabled={isLoading || fioIsLoading}
            required
          />

          <label htmlFor="password">Password*</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={handleLoginInputChange}
            disabled={isLoading || fioIsLoading}
            required
          />

          <div className="recaptcha-wrapper">
            <ReCaptcha
              sitekey="6LeF6AcsAAAAAAOswhxu2aHDKaLBZS4YgD-FdH61"
              callback={handleRecaptcha}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={!submitEnabled || isLoading || fioLoading}
          >
            {isLoading ? "Logging in..." : "Log in with Password"}
          </button>

          {/* FaceIO Login Option */}
          <div className="face-login-option">
            <button
              type="button"
              onClick={handleFaceLogin}
              disabled={fioIsLoading || fioLoading}
              className="face-login-btn"
            >
              {fioIsLoading ? "Authenticating..." : "Or Log in with Face"}
            </button>
            {fioLoading && <p className="fio-loading">Loading FaceIO...</p>}
          </div>

          <p className="footer-text">
            Don't have an account?{" "}
            <button type="button" onClick={goToSignup} className="link-button">
              Sign Up
            </button>
          </p>

          <button
            type="button"
            onClick={handleSkipToHome}
            className="skip-button"
          >
            Skip to Home
          </button>

          <small>
            By logging in, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </small>

          <p className="social-text">our social platforms</p>
          <div className="social-icons">
            <a href="https://www.instagram.com/_samuel4422/" target="_blank" rel="noopener noreferrer">
              <i className="bx bxl-instagram"></i>
            </a>
            <a href="https://wa.me/27817118312" target="_blank" rel="noopener noreferrer">
              <i className="bx bxl-whatsapp"></i>
            </a>
            <a href="https://github.com/samuelmbaya" target="_blank" rel="noopener noreferrer">
              <i className="bx bxl-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/samuel-mbaya-8316b0344/" target="_blank" rel="noopener noreferrer">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;