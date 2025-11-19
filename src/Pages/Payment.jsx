import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Credit card data
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  // PayPal and Google Pay emails
  const [paypalEmail, setPaypalEmail] = useState("");
  const [googlePayEmail, setGooglePayEmail] = useState("");

  // Loading state for processing payment
  const [loading, setLoading] = useState(false);

  // Cart and user info
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const apiUrl = "http://44.198.25.29:3000";

  // Disable scrolling on mount, restore on unmount
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Load current user and cart from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

    if (!storedUser.email || storedIsLoggedIn !== "true") {
      navigate("/");
      return;
    }

    setCurrentUser(storedUser);

    const userCart = JSON.parse(
      localStorage.getItem(`cart_${storedUser.email}`) || "[]"
    );
    setCart(userCart);
  }, [navigate]);

  // Calculate total cart price
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Remove item from cart and update localStorage
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);

    if (currentUser?.email) {
      localStorage.setItem(
        `cart_${currentUser.email}`,
        JSON.stringify(updatedCart)
      );
    }
  };

  // Luhn algorithm to validate credit card number
  const isValidCard = (num) => {
    const value = num.replace(/\s/g, "");
    if (!/^\d+$/.test(value)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Format card number as "#### #### #### ####"
  const formatCardNumber = (num) =>
    num.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

  // Handle card input changes
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: name === "number" ? formatCardNumber(value) : value,
    }));
  };

  // Email validation helper
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Expiry date validation helper
  const isExpiryValid = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + yearStr, 10);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    // Set expiry date to the last day of the month
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    return expiryDate >= now;
  };

  // ✅ FIXED: Handle order placement with backend integration
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Validate based on payment method
    if (paymentMethod === "credit-card") {
      const { number, name, expiry, cvc } = cardData;

      if (!number || !name || !expiry || !cvc) {
        alert("Please fill all card details!");
        return;
      }

      if (!isExpiryValid(expiry)) {
        alert("Invalid or expired expiration date. Use MM/YY format.");
        return;
      }

      if (!/^\d{3,4}$/.test(cvc)) {
        alert("Invalid CVC");
        return;
      }

      if (!isValidCard(number)) {
        alert("Invalid card number");
        return;
      }
    } else if (paymentMethod === "paypal") {
      if (!paypalEmail) {
        alert("Enter PayPal email!");
        return;
      }
      if (!isValidEmail(paypalEmail)) {
        alert("Enter a valid PayPal email!");
        return;
      }
    } else if (paymentMethod === "google-pay") {
      if (!googlePayEmail) {
        alert("Enter Google Pay email!");
        return;
      }
      if (!isValidEmail(googlePayEmail)) {
        alert("Enter a valid Google Pay email!");
        return;
      }
    }

    setLoading(true);

    try {
      // Get delivery data from localStorage (saved in Delivery.jsx)
      const deliveryData = JSON.parse(localStorage.getItem('deliveryData') || '{}');
      
      // ✅ Prepare order items with explicit imageUrl field
      const orderItems = cart.map(item => ({
        _id: item._id,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || item.imageURL || item.image || "https://via.placeholder.com/80" // ✅ Ensure image is included
      }));

      const orderData = {
        userId: currentUser.id || currentUser._id,
        items: orderItems,
        totalAmount: totalPrice,
        status: "pending",
        deliveryData: deliveryData,
        paymentMethod: paymentMethod
      };

      // ✅ Send order to backend
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Order created successfully:", result);

      // ✅ Save order to localStorage with backend _id
      if (result.data) {
        const savedOrder = {
          id: result.data._id, // Use backend _id
          date: new Date(result.data.createdAt).toLocaleDateString(),
          status: result.data.status,
          items: result.data.items, // This includes imageUrl
          total: result.data.totalAmount,
          paymentMethod: result.data.paymentMethod,
          deliveryData: result.data.deliveryData
        };

        // Add to existing orders
        let userOrders = JSON.parse(
          localStorage.getItem(`orders_${currentUser.email}`) || "[]"
        );
        userOrders.push(savedOrder);
        localStorage.setItem(
          `orders_${currentUser.email}`,
          JSON.stringify(userOrders)
        );

        // Clear the cart after successful order
        localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
        setCart([]);

        setLoading(false);
        alert("Payment successful! Order placed.");
        navigate("/Orders");
      }

    } catch (error) {
      console.error("❌ Error creating order:", error);
      
      // ⚠️ Fallback: Save to localStorage only if backend fails
      const fallbackOrder = {
        id: "ORD-" + Date.now(),
        date: new Date().toLocaleDateString(),
        status: "Processing",
        items: cart.map(item => ({
          ...item,
          imageUrl: item.imageUrl || item.imageURL || "https://via.placeholder.com/80"
        })),
        total: totalPrice,
        paymentMethod,
      };

      let userOrders = JSON.parse(
        localStorage.getItem(`orders_${currentUser.email}`) || "[]"
      );
      userOrders.push(fallbackOrder);
      localStorage.setItem(
        `orders_${currentUser.email}`,
        JSON.stringify(userOrders)
      );

      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
      setCart([]);

      setLoading(false);
      alert("Order saved locally. Backend unavailable. Order placed successfully!");
      navigate("/Orders");
    }
  };

  return (
    <div className="payment-fullscreen">
      <div className="payment-wrapper">
        <h2>Checkout Payment</h2>

        <div className="payment-container">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item-row" key={item._id}>
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/60"}
                      alt={item.name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-info">
                      <p>{item.name}</p>
                      <p>
                        Qty: {item.quantity || 1} | R{" "}
                        {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="total">Total: R {totalPrice.toFixed(2)}</p>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <div className="payment-methods">
              <label htmlFor="credit-card">
                <input
                  id="credit-card"
                  type="radio"
                  value="credit-card"
                  checked={paymentMethod === "credit-card"}
                  onChange={() => setPaymentMethod("credit-card")}
                />
                Credit Card
              </label>
              <label htmlFor="paypal">
                <input
                  id="paypal"
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                />
                PayPal
              </label>
              <label htmlFor="google-pay">
                <input
                  id="google-pay"
                  type="radio"
                  value="google-pay"
                  checked={paymentMethod === "google-pay"}
                  onChange={() => setPaymentMethod("google-pay")}
                />
                Google Pay
              </label>
            </div>

            {paymentMethod === "credit-card" && (
              <div className="card-form">
                <div className="card-preview">
                  <div className="card-number">
                    {cardData.number || "#### #### #### ####"}
                  </div>
                  <div className="card-details">
                    <span>{cardData.name || "CARDHOLDER NAME"}</span>
                    <span>{cardData.expiry || "MM/YY"}</span>
                  </div>
                </div>

                <label htmlFor="card-number" className="sr-only">Card Number</label>
                <input
                  id="card-number"
                  type="text"
                  name="number"
                  placeholder="Card Number"
                  value={cardData.number}
                  onChange={handleCardChange}
                  maxLength={19}
                  autoComplete="cc-number"
                />

                <label htmlFor="card-name" className="sr-only">Cardholder Name</label>
                <input
                  id="card-name"
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardData.name}
                  onChange={handleCardChange}
                  autoComplete="cc-name"
                />

                <div className="card-row">
                  <label htmlFor="card-expiry" className="sr-only">Expiry Date</label>
                  <input
                    id="card-expiry"
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleCardChange}
                    maxLength={5}
                    autoComplete="cc-exp"
                  />

                  <label htmlFor="card-cvc" className="sr-only">CVC</label>
                  <input
                    id="card-cvc"
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardData.cvc}
                    onChange={handleCardChange}
                    maxLength={4}
                    autoComplete="cc-csc"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div className="paypal-form">
                <label htmlFor="paypal-email" className="sr-only">PayPal Email</label>
                <input
                  id="paypal-email"
                  type="email"
                  placeholder="PayPal Email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}

            {paymentMethod === "google-pay" && (
              <div className="google-pay-form">
                <label htmlFor="googlepay-email" className="sr-only">Google Pay Email</label>
                <input
                  id="googlepay-email"
                  type="email"
                  placeholder="Google Pay Email"
                  value={googlePayEmail}
                  onChange={(e) => setGooglePayEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            )}

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>

            <button
              className="back-to-cart-btn"
              onClick={() => navigate("/Cart")}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;