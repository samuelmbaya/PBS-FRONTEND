import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

      if (storedUser && storedIsLoggedIn === "true") {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        // ✅ Load user's wishlist safely
        const userWishlist = JSON.parse(
          localStorage.getItem(`wishlist_${parsedUser.email}`) || "[]"
        );
        setWishlist(userWishlist);

        // ✅ Load theme preference, default true (dark)
        const userDarkMode = localStorage.getItem(`darkMode_${parsedUser.email}`);
        if (userDarkMode !== null) {
          setDarkMode(JSON.parse(userDarkMode));
        }
      } else {
        // ✅ Prevent multiple alerts with sessionStorage flag
        if (!sessionStorage.getItem("wishlistAlertShown")) {
          alert("Please log in to view your wishlist.");
          sessionStorage.setItem("wishlistAlertShown", "true");
        }
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
      alert("Error loading wishlist, please login again.");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // ✅ Persist wishlist changes to localStorage
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(
        `wishlist_${currentUser.email}`,
        JSON.stringify(wishlist)
      );
    }
  }, [wishlist, currentUser]);

  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item._id !== id)
    );
  };

  const handleContinueShopping = () => {
    navigate("/ProductPage");
  };

  return (
    <div className={`wishlist-page ${darkMode ? "dark" : "light"}`}>
      <div className="wishlist-header">
        <h1>Your Wishlist</h1>
        <button
          onClick={handleContinueShopping}
          className="continue-shopping-btn"
        >
          Continue Shopping
        </button>
      </div>

      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="wishlist-items">
          {wishlist.map((item) => (
            <div className="wishlist-item" key={item._id}>
              <img
                src={item.imageUrl || "https://via.placeholder.com/100"}
                alt={item.name}
                className="wishlist-item-img"
              />

              <div className="wishlist-item-info">
                <h3>{item.name}</h3>
                <p>R {item.price ? item.price.toLocaleString() : "0.00"}</p>
              </div>

              <button
                onClick={() => removeFromWishlist(item._id)}
                className="remove-btn"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
