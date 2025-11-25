import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Load cart for the logged-in user (updated: fallback check, no alert)
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedUser && storedIsLoggedIn === "true") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);

          // Load user cart from localStorage
          const userCart = JSON.parse(
            localStorage.getItem(`cart_${parsedUser.email}`) || "[]"
          );
          setCart(userCart);

          // Load user wishlist from localStorage
          const userWishlist = JSON.parse(
            localStorage.getItem(`wishlist_${parsedUser.email}`) || "[]"
          );
          setWishlist(userWishlist);
        } else {
          // Fallback: Redirect to login (ProtectedRoute should handle this, but safe)
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        navigate("/login", { replace: true });
      }
    };

    loadUserData();
  }, [navigate]);

  // Save cart updates to localStorage
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // Save wishlist updates to localStorage
  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  // Functions for cart operations
  const increaseQuantity = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const handleContinueShopping = () => {
    navigate("/ProductPage");
  };

  const handleCheckout = () => {
    navigate("/delivery");
  };

  return (
    <div className="cart-page-container">
      <Navbar cartCount={getItemCount()} wishlistCount={wishlist.length} />

      {/* Hero Section */}
      <section className="cart-hero">
        <div className="cart-hero-content">
          <h1 className="cart-hero-title">Shopping Cart</h1>
          <p className="cart-hero-subtitle">
            {cart.length === 0 
              ? "Your cart is empty" 
              : `${getItemCount()} ${getItemCount() === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="cart-content">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <button onClick={handleContinueShopping} className="shop-now-btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              {cart.map((item) => (
                <div className="cart-card" key={item._id}>
                  <div className="cart-item-image-container">
                    <img
                      src={item.imageUrl || item.imageURL || "https://via.placeholder.com/200"}
                      alt={item.name}
                      className="cart-item-img"
                    />
                  </div>

                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-price">
                      R {item.price ? item.price.toLocaleString() : "0.00"}
                    </p>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() => decreaseQuantity(item._id)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-display">{item.quantity || 1}</span>
                        <button
                          onClick={() => increaseQuantity(item._id)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="remove-item-btn"
                        aria-label={`Remove ${item.name}`}
                      >
                        <span className="remove-icon">✕</span>
                        Remove
                      </button>
                    </div>

                    <div className="item-subtotal">
                      Subtotal: R {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary-section">
              <div className="cart-summary-card">
                <h2 className="summary-title">Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>R {getTotal().toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">Free</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>R {getTotal().toLocaleString()}</span>
                </div>

                <button onClick={handleCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>

                <button onClick={handleContinueShopping} className="continue-shopping-link">
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;