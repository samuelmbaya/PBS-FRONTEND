import { useState, useEffect } from "react";
import "./Signup.css";

const Signup = () => {
  // ✅ Use Vite environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL;

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
        setMessage("Registration successful! Redirecting to Home Page...");
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
        setTimeout(() => (window.location.href = "/Home"), 2000);
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
      window.location.href = "/ProtectedRoutez";
    } else {
      alert("You must be logged in to access this page.");
    }
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="signup-body">
      <div className="signup-container">
        {message && (
          <div
            className={`message ${
              message.toLowerCase().includes("successful") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <div className="signup-form-box">
          <div className="form-container">
            <h1>Sign Up</h1>
            <form onSubmit={handleRegister}>
              <div className="input-box">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={registerData.name}
                  onChange={handleRegisterInputChange}
                  disabled={isLoading}
                  required
                />
                <i className="bx bxs-user"></i>
              </div>

              <div className="input-box">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={registerData.email}
                  onChange={handleRegisterInputChange}
                  disabled={isLoading}
                  required
                />
                <i className="bx bxs-envelope"></i>
              </div>

              <div className="input-box">
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 8 characters)"
                  value={registerData.password}
                  onChange={handleRegisterInputChange}
                  disabled={isLoading}
                  required
                />
                <i className="bx bxs-lock-alt"></i>
              </div>

              <div className="input-box">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterInputChange}
                  disabled={isLoading}
                  required
                />
                <i className="bx bxs-lock-alt"></i>
              </div>

              <button type="submit" className="signup-btn" disabled={isLoading}>
                {isLoading ? "Registering..." : "Sign Up"}
              </button>
            </form>

            <div className="auth-links">
              <p>
                Already have an account?{" "}
                <button onClick={goToLogin} className="link-btn" type="button">
                  Login
                </button>
              </p>
              <button onClick={handleSkipToHome} className="skip-btn" type="button">
                Skip to Home
              </button>
            </div>

            <p className="social-text">or register with social platforms</p>
            <div className="social-icons">
              <a href="#" aria-label="Register with Google">
                <i className="bx bxl-google"></i>
              </a>
              <a href="#" aria-label="Register with Facebook">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#" aria-label="Register with GitHub">
                <i className="bx bxl-github"></i>
              </a>
              <a href="#" aria-label="Register with LinkedIn">
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
