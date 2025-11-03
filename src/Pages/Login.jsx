  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import "./Login.css";

  const Login = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showUserGreeting, setShowUserGreeting] = useState(false);
    const [loginData, setLoginData] = useState({
      username: "",
      password: "",
    });

    // ✅ Check localStorage for existing user session
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

    // ✅ Save user to localStorage
    const saveUserToLocalStorage = (userData) => {
      try {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");

        const existingWishlist = localStorage.getItem(
          `wishlist_${userData.email}`
        );
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

    // ✅ Handle input
    const handleLoginInputChange = (e) => {
      const { name, value } = e.target;
      setLoginData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    // ✅ Handle login
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
        setMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ Skip button
    const handleSkipToHome = () => {
      if (isAuthenticated && currentUser) {
        navigate("/ProtectedRoutez");
      } else {
        alert("You must be logged in to access this page.");
      }
    };

    // ✅ Go to signup
    const goToSignup = () => {
      navigate("/signup");
    };

    return (
      <div className="login-body">
        <div className="login-container">
          {message && (
            <div
              className={`message ${
                message.includes("successful") ? "success" : "error"
              }`}
            >
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
                    disabled={isLoading}
                    required
                  />
                  <i className="bx bxs-user"></i>
                </div>
                <div className="input-box">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    disabled={isLoading}
                    required
                  />
                  <i className="bx bxs-lock-alt"></i>
                </div>
                <div className="forgot-link">
                  <a href="#">Forgot Password?</a>
                </div>
                <button type="submit" className="login-btn" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="auth-links">
                <p>
                  Don't have an account?{" "}
                  <button onClick={goToSignup} className="link-btn">
                    Sign up
                  </button>
                </p>
                <button onClick={handleSkipToHome} className="skip-btn">
                  Skip to Home
                </button>
              </div>

              <p className="social-text">or login with social platforms</p>
              <div className="social-icons">
                <a href="#">
                  <i className="bx bxl-google"></i>
                </a>
                <a href="#">
                  <i className="bx bxl-facebook"></i>
                </a>
                <a href="#">
                  <i className="bx bxl-github"></i>
                </a>
                <a href="#">
                  <i className="bx bxl-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default Login;
