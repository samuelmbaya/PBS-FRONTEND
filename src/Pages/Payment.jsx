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

  // Disable scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Load user + cart
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

  // Calculate total
  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Remove item
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

  // Card validation helpers
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

  const formatCardNumber = (num) =>
    num.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: name === "number" ? formatCardNumber(value) : value,
    }));
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isExpiryValid = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + yearStr, 10);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    return expiryDate >= now;
  };

  // --------------------------------------------------------
  //  UPDATED handlePlaceOrder (NO FALLBACK + FIXED REDIRECT)
  // --------------------------------------------------------
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Validation
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
    }

    if (paymentMethod === "paypal" && !isValidEmail(paypalEmail)) {
      alert("Enter a valid PayPal email!");
      return;
    }

    if (paymentMethod === "google-pay" && !isValidEmail(googlePayEmail)) {
      alert("Enter a valid Google Pay email!");
      return;
    }

    setLoading(true);

    try {
      const deliveryData = JSON.parse(
        localStorage.getItem("deliveryData") || "{}"
      );

      const orderItems = cart.map((item) => ({
        _id: item._id,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        imageUrl:
          item.imageUrl ||
          item.imageURL ||
          item.image ||
          "https://via.placeholder.com/80",
      }));

      const orderData = {
        userId: currentUser.id || currentUser._id,
        items: orderItems,
        totalAmount: totalPrice,
        status: "pending",
        deliveryData,
        paymentMethod,
      };

      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const result = await response.json();
      console.log("Order created successfully:", result);

      // FIX: support multiple backend formats
      const order = result.data || result.order;

      if (!order) {
        alert("Order created but server response format is unexpected.");
        setLoading(false);
        return;
      }

      // Save order
      const savedOrder = {
        id: order._id,
        date: new Date(order.createdAt).toLocaleDateString(),
        status: order.status,
        items: order.items,
        total: order.totalAmount,
        paymentMethod: order.paymentMethod,
        deliveryData: order.deliveryData,
      };

      let userOrders = JSON.parse(
        localStorage.getItem(`orders_${currentUser.email}`) || "[]"
      );
      userOrders.push(savedOrder);

      localStorage.setItem(
        `orders_${currentUser.email}`,
        JSON.stringify(userOrders)
      );

      // Clear cart
      localStorage.setItem(
        `cart_${currentUser.email}`,
        JSON.stringify([])
      );
      setCart([]);

      setLoading(false);
      navigate("/Orders"); // FIXED REDIRECT
    } catch (error) {
      console.error("Error creating order:", error);
      setLoading(false);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="payment-fullscreen">
      <div className="payment-wrapper">
        <h2>Checkout Payment</h2>

        <div className="payment-container">

          {/* ORDER SUMMARY */}
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
                        Qty: {item.quantity} | R{" "}
                        {(item.price * item.quantity).toFixed(2)}
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

          {/* PAYMENT SECTION */}
          <div className="payment-section">
            <div className="payment-methods">
              <label>
                <input
                  type="radio"
                  value="credit-card"
                  checked={paymentMethod === "credit-card"}
                  onChange={() => setPaymentMethod("credit-card")}
                />
                Credit Card
              </label>

              <label>
                <input
                  type="radio"
                  value="paypal"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                />
                PayPal
              </label>

              <label>
                <input
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
                <input
                  type="text"
                  name="number"
                  placeholder="Card Number"
                  value={cardData.number}
                  onChange={handleCardChange}
                  maxLength={19}
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardData.name}
                  onChange={handleCardChange}
                />
                <div className="card-row">
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleCardChange}
                    maxLength={5}
                  />
                  <input
                    type="text"
                    name="cvc"
                    placeholder="CVC"
                    value={cardData.cvc}
                    onChange={handleCardChange}
                    maxLength={4}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <input
                type="email"
                placeholder="PayPal Email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
              />
            )}

            {paymentMethod === "google-pay" && (
              <input
                type="email"
                placeholder="Google Pay Email"
                value={googlePayEmail}
                onChange={(e) => setGooglePayEmail(e.target.value)}
              />
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
