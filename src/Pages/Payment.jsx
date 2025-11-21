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

  // Promo code
  const [promoCode, setPromoCode] = useState("");

  // Loading state for processing payment
  const [loading, setLoading] = useState(false);

  // Cart and user info
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const apiUrl = "http://44.198.25.29:3000";

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

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Calculate shipping (free for now, but can be modified)
  const shipping = 0;

  // Calculate total
  const totalPrice = subtotal + shipping;

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
    const expiryDate = new Date(year, month, 0, 23, 59, 59);
    return expiryDate >= now;
  };

  // Handle order placement with backend integration
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
      const deliveryData = JSON.parse(localStorage.getItem("deliveryData") || "{}");

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

      if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Order created successfully:", result);

      if (result.data) {
        const savedOrder = {
          id: result.data._id,
          date: new Date(result.data.createdAt).toLocaleDateString(),
          status: result.data.status,
          items: result.data.items,
          total: result.data.totalAmount,
          paymentMethod: result.data.paymentMethod,
          deliveryData: result.data.deliveryData,
        };

        let userOrders = JSON.parse(
          localStorage.getItem(`orders_${currentUser.email}`) || "[]"
        );
        userOrders.push(savedOrder);

        localStorage.setItem(
          `orders_${currentUser.email}`,
          JSON.stringify(userOrders)
        );

        localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify([]));
        setCart([]);

        setLoading(false);
        alert("Payment successful! Order placed.");
        navigate("/Orders");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setLoading(false);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="payment-fullscreen">
      <div className="payment-wrapper">
        {/* Header */}
        <div className="payment-header">
          <div className="payment-logo">PBS ELECTRICAL</div>
        </div>


        <div className="payment-container">
          {/* Payment Section (Left) */}
          <div className="payment-section">
            {/* Payment Method Selection */}
            <div className="form-section">
              <h3 className="section-title">Payment Method</h3>
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

              {/* Credit Card Form */}
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

                  <label htmlFor="card-number" className="sr-only">
                    Card Number
                  </label>
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

                  <label htmlFor="card-name" className="sr-only">
                    Cardholder Name
                  </label>
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
                    <div>
                      <label htmlFor="card-expiry" className="sr-only">
                        Expiry Date
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        name="expiry"
                        placeholder="Expiry (MM/YY)"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        maxLength={5}
                        autoComplete="cc-exp"
                      />
                    </div>

                    <div>
                      <label htmlFor="card-cvc" className="sr-only">
                        CVC
                      </label>
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
                </div>
              )}

              {/* PayPal Form */}
              {paymentMethod === "paypal" && (
                <div className="paypal-form">
                  <label htmlFor="paypal-email" className="sr-only">
                    PayPal Email
                  </label>
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

              {/* Google Pay Form */}
              {paymentMethod === "google-pay" && (
                <div className="google-pay-form">
                  <label htmlFor="googlepay-email" className="sr-only">
                    Google Pay Email
                  </label>
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
            </div>

            {/* Action Buttons */}
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing" : "Complete Order"}
            </button>

            <button
              className="back-to-cart-btn"
              onClick={() => navigate("/Cart")}
            >
              ‹ Return to cart
            </button>
          </div>

          {/* Order Summary (Right) */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item-row" key={item._id}>
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/70"}
                        alt={item.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <p>{item.name}</p>
                        <p>Qty: {item.quantity || 1}</p>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="cart-item-price">
                        R {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="promo-section">
                  <div className="promo-input-group">
                    <input
                      type="text"
                      placeholder="Discount code or gift card"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button className="apply-btn">Apply</button>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `R ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="total-row final-total">
                    <span>Total</span>
                    <span>R {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;