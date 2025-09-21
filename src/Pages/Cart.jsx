import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiUrl } from "../ApiContext"; // ✅ Import API context hook
import "./Cart.css";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const apiUrl = useApiUrl(); // ✅ Get API URL from context

  // Load cart for the logged-in user
  useEffect(() => {
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
      } else {
        alert("Please log in to view your cart.");
        navigate("/");
      }
    } catch (err) {
      console.error("Error loading cart:", err);
      alert("Error loading cart, please login again.");
      navigate("/");
    }
  }, [navigate]);

  // Save cart updates to localStorage
  useEffect(() => {
    if (currentUser && currentUser.email) {
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // 🔄 Optional: Example for syncing cart to backend using API URL
  /*
  useEffect(() => {
    if (currentUser && cart.length > 0) {
      fetch(`${apiUrl}/api/sync-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: currentUser.email, cart })
      })
        .then((res) => res.json())
        .then((data) => console.log("Cart synced:", data))
        .catch((err) => console.error("Error syncing cart:", err));
    }
  }, [cart, currentUser, apiUrl]);
  */

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

  const handleContinueShopping = () => {
    navigate("/ProductPage");
  };

  return (
    <div className="cart-page dark">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <button onClick={handleContinueShopping} className="continue-shopping-btn">
          Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <img
                  src={item.imageURL || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>R {item.price ? item.price.toLocaleString() : "0.00"}</p>
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item._id)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => increaseQuantity(item._id)}>+</button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: R {getTotal().toLocaleString()}</h2>
            <button onClick={() => navigate("/delivery")} className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
