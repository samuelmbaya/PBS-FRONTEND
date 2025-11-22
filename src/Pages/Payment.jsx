import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
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
  const [promoApplied, setPromoApplied] = useState(false);

  // Loading state for processing payment
  const [loading, setLoading] = useState(false);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Cart and user info
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const apiUrl = "http://44.198.25.29:3000";

  // Initialize EmailJS (add your public key here)
  useEffect(() => {
    emailjs.init('aEC3095geTrpzu0k1'); // Replace with your EmailJS public key
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

  // Calculate subtotal
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Calculate shipping (free for now, but can be modified)
  const shipping = 0;

  // Calculate discount
  const discount = promoApplied ? subtotal * 0.1 : 0;

  // Calculate total
  const totalPrice = subtotal + shipping - discount;

  // Update quantity
  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map((item) => {
      if (item._id === productId) {
        const newQuantity = Math.max(1, (item.quantity || 1) + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);

    if (currentUser?.email) {
      localStorage.setItem(
        `cart_${currentUser.email}`,
        JSON.stringify(updatedCart)
      );
    }
  };

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

  // Format expiry
  const formatExpiry = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{0,2})/, "$1/$2")
      .slice(0, 5);
  };

  // Email validation helper
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "PBS2025") {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  };

  // Send order receipt email using EmailJS
  const sendOrderReceipt = async (orderData) => {
    try {
      const deliveryData = JSON.parse(localStorage.getItem("deliveryData") || "{}");
      
      // Format order items for email
      const orderItemsText = orderData.items
        .map((item) => `${item.name} (x${item.quantity}) - R ${(item.price * item.quantity).toFixed(2)}`)
        .join('\n');

      // Format delivery address
      const deliveryAddress = deliveryData.streetAddress 
        ? `${deliveryData.streetAddress}${deliveryData.apartment ? ', ' + deliveryData.apartment : ''}\n${deliveryData.city}, ${deliveryData.province} ${deliveryData.postalCode}\n${deliveryData.countryName}`
        : 'Pickup location: ' + (deliveryData.pickupLocation || 'Not specified');

      const templateParams = {
        to_email: currentUser.email,
        user_name: currentUser.name || currentUser.email.split('@')[0],
        order_id: orderData.orderId,
        order_date: new Date().toLocaleDateString('en-ZA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        payment_method: paymentMethod === 'credit-card' 
          ? 'Credit Card' 
          : paymentMethod === 'paypal' 
          ? 'PayPal' 
          : 'Google Pay',
        order_items: orderItemsText,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        shipping: shipping === 0 ? 'Free' : shipping.toFixed(2),
        total: totalPrice.toFixed(2),
        delivery_address: deliveryAddress,
      };

      const response = await emailjs.send(
        'service_meuwp9x',      // Replace with your EmailJS service ID
        'template_ihc5ihs',     // Replace with your EmailJS template ID
        templateParams
      );

      console.log('Order receipt email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to send order receipt email:', error);
      // Don't throw error - we don't want email failure to stop the order
      return null;
    }
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

        // Generate transaction ID
        const transId = 'TXN' + Date.now();

        // Send order receipt email
        await sendOrderReceipt({
          orderId: savedOrder.id,
          items: savedOrder.items,
        });

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

        setTransactionId(transId);
        setIsSuccess(true);
        setLoading(false);

        // Navigate after 3 seconds
        setTimeout(() => {
          navigate("/Orders");
        }, 3000);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setLoading(false);
      alert("Failed to place order. Please try again.");
    }
  };

  // Handle back to cart
  const handleBackToCart = () => {
    navigate("/Cart");
  };

  // Handle back to home from success
  const handleBackToHome = () => {
    navigate("/");
  };

  if (isSuccess) {
    return (
      <div className="payment-success-screen">
        <div className="success-header">
          <button className="back-btn" onClick={handleBackToHome}>
            ‹
          </button>
          <h1>Payment</h1>
          <div className="header-dots">•••</div>
        </div>
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Successfully paid R {totalPrice.toFixed(2)}</p>
          <div className="transaction-details">
            <div className="detail-row">
              <span>Transaction ID</span>
              <span>{transactionId}</span>
            </div>
            <div className="detail-row">
              <span>Date</span>
              <span>{new Date().toLocaleDateString('en-ZA')}</span>
            </div>
            <div className="detail-row">
              <span>Type of Transaction</span>
              <span>Credit Card</span>
            </div>
            <div className="detail-row">
              <span>Tax</span>
              <span>R 0.00</span>
            </div>
            <div className="detail-row">
              <span>Status</span>
              <span>Success</span>
            </div>
          </div>
          <button className="back-home-btn" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-fullscreen">
      <div className="payment-wrapper">
        {/* Header */}
        <div className="payment-header">
          <button className="back-btn" onClick={handleBackToCart}>
            ‹
          </button>
          <div className="payment-logo">Payment</div>
          <div className="header-dots">•••</div>
        </div>

        <div className="payment-container">
          {/* Payment Section */}
          <div className="payment-section">
            {/* Payment Method Selection */}
            <div className="form-section">
              <h3 className="section-title">Payment Method</h3>
              <div className="payment-methods-grid">
                <button
                  className={`method-btn ${paymentMethod === "credit-card" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("credit-card")}
                >
                  <span className="method-icon">+ Add Card</span>
                </button>
                <button
                  className={`method-btn ${paymentMethod === "paypal" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("paypal")}
                >
                  <span className="method-icon">PayPal</span>
                </button>
                <button
                  className={`method-btn ${paymentMethod === "google-pay" ? "selected" : ""}`}
                  onClick={() => setPaymentMethod("google-pay")}
                >
                  <span className="method-icon">Google Pay</span>
                </button>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === "credit-card" && (
                <div className="card-form">
                  <div className="card-preview">
                    <div className="card-type">VISA</div>
                    <div className="card-number">
                      {cardData.number.replace(/\s/g, '') || "•••• •••• •••• ••••"}
                    </div>
                    <div className="card-name">{cardData.name || "Cardholder Name"}</div>
                    <div className="card-expiry-cvc">
                      <span>{cardData.expiry || "MM/YY"}</span>
                      <span>{cardData.cvc || "CVV"}</span>
                    </div>
                  </div>

                  <input
                    type="text"
                    name="number"
                    placeholder="Card Number"
                    value={cardData.number}
                    onChange={handleCardChange}
                    maxLength={19}
                    className="form-input"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Cardholder Name"
                    value={cardData.name}
                    onChange={handleCardChange}
                    className="form-input"
                  />

                  <div className="card-row">
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                      maxLength={5}
                      className="form-input half"
                    />
                    <input
                      type="text"
                      name="cvc"
                      placeholder="CVV"
                      value={cardData.cvc}
                      onChange={handleCardChange}
                      maxLength={4}
                      className="form-input half"
                    />
                  </div>
                </div>
              )}

              {/* PayPal Form */}
              {paymentMethod === "paypal" && (
                <div className="paypal-form">
                  <input
                    type="email"
                    placeholder="PayPal Email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}

              {/* Google Pay Form */}
              {paymentMethod === "google-pay" && (
                <div className="google-pay-form">
                  <input
                    type="email"
                    placeholder="Google Pay Email"
                    value={googlePayEmail}
                    onChange={(e) => setGooglePayEmail(e.target.value)}
                    className="form-input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
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
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item._id, -1)}
                          >
                            −
                          </button>
                          <span className="quantity-display">
                            {item.quantity || 1}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
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
                      className="form-input"
                    />
                    <button className="apply-btn" onClick={applyPromoCode}>
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="promo-success">✓ Code PBS2025 applied!</p>
                  )}
                </div>

                {/* Order Totals */}
                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="total-row discount-row">
                      <span>Discount (10%)</span>
                      <span className="discount-amount">
                        -R {discount.toFixed(2)}
                      </span>
                    </div>
                  )}
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

        {/* Action Button */}
        <div className="payment-actions">
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Processing..." : `Confirm Payment R ${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;