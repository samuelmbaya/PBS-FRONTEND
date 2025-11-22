import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://44.198.25.29:3000";

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedUser && storedIsLoggedIn === "true") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("wishlist");
      }
    };

    checkAuthStatus();
  }, []);

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (message) setMessage("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Client-side validation
    if (!registerData.name.trim()) {
      setMessage("Name is required");
      setIsLoading(false);
      return;
    }
    if (!registerData.email.includes("@")) {
      setMessage("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (registerData.password.length < 8) {
      setMessage("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Redirecting to Login Page...");
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToHome = () => {
    if (isAuthenticated && currentUser) {
      navigate("/ProtectedRoutez");
    } else {
      setMessage("You must be logged in to access this page.");
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="signup-container">
      {/* Left Side - Background Image */}
      <div className="signup-left">
        <div className="signup-image-overlay"></div>
        <div className="video-overlay">
          <h2>Join SneakerVerse Today</h2>
          <p>Create your account and unlock exclusive access to premium sneaker designs.</p>
          <span>
            <strong>SneakerVerse</strong> — Where style meets innovation.
          </span>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="signup-right">
        {message && (
          <div className={`signup-message ${message.toLowerCase().includes("successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form className="signup-form" onSubmit={handleRegister}>
          <h2>Create your account</h2>

          <label htmlFor="name">Full Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={registerData.name}
            onChange={handleRegisterInputChange}
            disabled={isLoading}
            required
          />

          <label htmlFor="email">Email address*</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={registerData.email}
            onChange={handleRegisterInputChange}
            disabled={isLoading}
            required
          />

          <label htmlFor="password">Password*</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Minimum 8 characters"
            value={registerData.password}
            onChange={handleRegisterInputChange}
            disabled={isLoading}
            required
          />

          <label htmlFor="confirmPassword">Confirm Password*</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={registerData.confirmPassword}
            onChange={handleRegisterInputChange}
            disabled={isLoading}
            required
          />

          <div className="signup-actions">
            <button
              type="button"
              onClick={handleSkipToHome}
              className="skip-home-btn"
            >
              Skip to Home
            </button>
            <button
              type="submit"
              className="signup-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>

          <p className="footer-text">
            Already have an account?{" "}
            <button type="button" onClick={goToLogin} className="link-button">
              Log In
            </button>
          </p>

          <small>
            By signing up, you agree to our{" "}
            <a href="/terms">Terms of Service</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </small>

          <p className="social-text">our social platforms</p>
          <div className="social-icons">
            <a href="https://www.instagram.com/_samuel4422/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="bx bxl-instagram"></i>
            </a>
            <a href="https://wa.me/27817118312" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="bx bxl-whatsapp"></i>
            </a>
            <a href="https://github.com/samuelmbaya" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="bx bxl-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/samuel-mbaya-8316b0344/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;