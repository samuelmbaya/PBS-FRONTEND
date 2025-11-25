import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Wishlist.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndLoadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedUser && storedIsLoggedIn === "true") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          loadUserSpecificData(parsedUser.email);
        } else {
          // Fallback: Redirect to login (ProtectedRoute should handle this, but safe)
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Error loading wishlist:", err);
        navigate("/login", { replace: true });
      }
    };

    const loadUserSpecificData = (userEmail) => {
      // Load user's wishlist safely
      const userWishlist = JSON.parse(
        localStorage.getItem(`wishlist_${userEmail}`) || "[]"
      );
      setWishlist(userWishlist);

      // Load user's cart for badge count
      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || "[]");
      setCart(userCart);
    };

    checkAuthAndLoadUserData();
  }, [navigate]);

  // Persist wishlist changes to localStorage
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

  const getCartItemCount = () => cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleContinueShopping = () => {
    navigate("/ProductPage");
  };

  return (
    <div className="wishlist-page-container">
      <Navbar cartCount={getCartItemCount()} wishlistCount={wishlist.length} />

      {/* Hero Section */}
      <section className="wishlist-hero">
        <div className="wishlist-hero-content">
          <h1 className="wishlist-hero-title">Your Wishlist</h1>
          <p className="wishlist-hero-subtitle">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="wishlist-content">
        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding products you love to your wishlist</p>
            <button onClick={handleContinueShopping} className="shop-now-btn">
              Explore Products
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {wishlist.map((item) => (
                <div className="wishlist-card" key={item._id}>
                  <div className="wishlist-image-container">
                    <img
                      src={item.imageUrl || item.imageURL || "https://via.placeholder.com/300"}
                      alt={item.name}
                      className="wishlist-img"
                    />
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="remove-icon"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="wishlist-card-info">
                    <h3 className="wishlist-product-name">{item.name}</h3>
                    <p className="wishlist-product-price">
                      R {item.price ? item.price.toLocaleString() : "0.00"}
                    </p>
                    <button
                      onClick={handleContinueShopping}
                      className="view-product-btn"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="wishlist-actions">
              <button onClick={handleContinueShopping} className="continue-btn">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;