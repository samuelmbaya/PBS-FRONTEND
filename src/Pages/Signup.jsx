import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFaceIO } from "../Components/FaceIOContext"; // Adjust path to your FaceIOContext (e.g., '../../contexts/FaceIOContext')
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const { faceio, loading: fioLoading, error: fioError, handleError, setError: setFioError } = useFaceIO();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://44.198.25.29:3000";

  const [isLoading, setIsLoading] = useState(false);
  const [fioIsLoading, setFioIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fioMessage, setFioMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false); // Flag to show FaceIO enrollment after traditional signup
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
        // Store user temporarily for enrollment payload
        localStorage.setItem("tempUser", JSON.stringify({ name: registerData.name, email: registerData.email }));
        setMessage("Registration successful! Enroll your face for easy future logins?");
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
        setShowEnroll(true); // Show enrollment option instead of auto-redirect
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

  // FaceIO Enrollment Handler (called after traditional signup)
  const handleEnrollFace = async () => {
    if (fioLoading || fioIsLoading || !faceio) {
      setFioMessage("FaceIO not ready. Please wait.");
      return;
    }
    if (!registerData.email) { // Fallback if no tempUser
      setFioMessage("Email required for enrollment.");
      return;
    }

    setFioIsLoading(true);
    setFioMessage("Enrolling your face...");
    setFioError(null);

    try {
      // Get temp user for payload
      const tempUser = JSON.parse(localStorage.getItem("tempUser") || "{}");
      const userData = await faceio.enroll({
        locale: "auto",
        payload: { 
          userId: tempUser.email, // Use email as unique ID; adjust if backend returns userId
          email: tempUser.email,
          name: tempUser.name
        },
      });
      setFioMessage(`Face enrolled successfully! Facial ID: ${userData.facialId}`);
      
      // Optional: Send facialId back to backend to associate with user
      // await fetch(`${API_BASE_URL}/associate-face`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: tempUser.email, facialId: userData.facialId }),
      // });

      // Clean up temp
      localStorage.removeItem("tempUser");
      
      // Auto-redirect to login after enrollment
      setTimeout(() => navigate("/login"), 2000);
    } catch (errCode) {
      handleError(errCode);
      setFioMessage("Enrollment failed. You can still log in with password.");
      setTimeout(() => navigate("/login"), 2000); // Redirect anyway
    } finally {
      setFioIsLoading(false);
    }
  };

  const skipEnroll = () => {
    localStorage.removeItem("tempUser");
    navigate("/login");
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

  // Show FaceIO-specific errors/messages
  if (fioError) {
    setMessage(fioError); // Reuse message for now; or add dedicated UI
    setFioError(null);
  }

  return (
    <div className="signup-container">
      {/* Left Side - Background Image */}
      <div className="signup-left">
        <div className="signup-image-overlay"></div>
        <div className="video-overlay">
          <h2>Get Started Today</h2>
          <p>Join thousands making the switch to sustainable energy.</p>
          <span>
            <strong>Powered By Samuel</strong> — Affordable. Clean. Reliable.
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
        {fioMessage && (
          <div className={`signup-message ${fioMessage.toLowerCase().includes("success") ? "success" : "error"}`}>
            {fioMessage}
          </div>
        )}

        {!showEnroll ? (
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
                disabled={isLoading || fioLoading}
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
        ) : (
          // Post-signup: FaceIO Enrollment Section
          <div className="enroll-section">
            <h2>Optional: Enroll Your Face</h2>
            <p>Scan your face to enable passwordless login next time.</p>
            <button
              onClick={handleEnrollFace}
              disabled={fioIsLoading || fioLoading}
              className="enroll-btn"
            >
              {fioIsLoading ? "Enrolling..." : "Enroll with Face"}
            </button>
            <button onClick={skipEnroll} className="skip-btn">
              Skip for Now
            </button>
            {fioLoading && <p>Loading FaceIO...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;