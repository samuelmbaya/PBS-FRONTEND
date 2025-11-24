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

  // Cart and user info
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Message state
  const [message, setMessage] = useState("");

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

  // Email validation helper
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Apply promo code
  const applyPromoCode = () => {
    setMessage("");
    if (promoCode.toUpperCase() === "PBS2025") {
      setPromoApplied(true);
      setMessage("Promo code applied! You saved 10%");
    } else {
      setPromoApplied(false);
      setMessage("Invalid promo code");
    }
  };

  // Helper to get full pickup location name
  const getPickupLocationName = (value, countryName) => {
    switch (value) {
      case 'main-store':
        return `Main Store - ${countryName}`;
      case 'downtown-branch':
        return `Downtown Branch - ${countryName}`;
      case 'outlet-center':
        return `Outlet Center - ${countryName}`;
      default:
        return value;
    }
  };

  // Send order receipt email using EmailJS
  const sendOrderReceipt = async (orderData) => {
    try {
      const deliveryData = JSON.parse(localStorage.getItem("deliveryData") || "{}");
      
      // Format delivery information based on delivery method
      let deliveryInfo = '';
      if (deliveryData.deliveryMethod === 'delivery') {
        const fullName = `${deliveryData.name || ''} ${deliveryData.lastName || ''}`.trim();
        const addressLine1 = `${deliveryData.streetAddress || ''}${deliveryData.apartment ? ', ' + deliveryData.apartment : ''}`.trim();
        const addressLine2 = `${deliveryData.city || ''}, ${deliveryData.province || ''} ${deliveryData.postalCode || ''}`.trim();
        deliveryInfo = `
          ${fullName || 'No name provided'}<br /><br />
          ${addressLine1 || 'No street address provided'}<br /><br />
          ${addressLine2 || 'No city/province/postal code provided'}<br /><br />
          ${deliveryData.countryName || deliveryData.country || 'No country provided'}<br /><br />
          Phone: ${deliveryData.phoneNumber || 'No phone number provided'}
        `.replace(/\n/g, '');  // Strip any remaining \n after <br />
      } else {
        const pickupLoc = getPickupLocationName(deliveryData.pickupLocation, deliveryData.countryName || deliveryData.country || '');
        deliveryInfo = `
          Pickup Location: ${pickupLoc || 'No pickup location provided'}<br /><br />
          Phone: ${deliveryData.phoneNumber || 'No phone number provided'}
        `.replace(/\n/g, '');
      }

      // Format payment information
      let paymentInfo = '';
      if (paymentMethod === 'credit-card') {
        const last4 = cardData.number ? cardData.number.replace(/\s/g, '').slice(-4) : 'XXXX';
        paymentInfo = `Cardholder: ${cardData.name || 'N/A'}<br />Card ending in: **** **** **** ${last4}<br />Expiry: ${cardData.expiry || 'N/A'}`;
      } else if (paymentMethod === 'paypal') {
        paymentInfo = `PayPal Email: ${paypalEmail || 'N/A'}`;
      } else if (paymentMethod === 'google-pay') {
        paymentInfo = `Google Pay Email: ${googlePayEmail || 'N/A'}`;
      }
      
      // Format order items for email
      const orderItemsText = orderData.items && orderData.items.length > 0
        ? orderData.items
            .map((item) => `${item.name || 'Unknown Item'} (x${item.quantity || 1}) - R ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`)
            .join('<br />')
        : 'No items in order';

      const discountStr = discount.toFixed(2);
      const hasDiscount = discount > 0;

      const templateParams = {
        to_email: currentUser?.email || '',
        user_name: (currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer') || 'Customer',
        order_id: orderData.orderId || 'Unknown',
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
        payment_info: paymentInfo || 'No payment details available',
        order_items: orderItemsText,
        subtotal: subtotal.toFixed(2),
        discount: discountStr,
        has_discount: hasDiscount,
        shipping: shipping === 0 ? 'Free' : `${shipping.toFixed(2)}`,
        total: totalPrice.toFixed(2),
        delivery_address: deliveryInfo || 'No delivery information available',
      };

      console.log('Sending email with params:', templateParams); // For debugging

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
    setMessage("");
    if (cart.length === 0) {
      setMessage("Your cart is empty!");
      return;
    }

    // Validate based on payment method
    if (paymentMethod === "credit-card") {
      const { number, name, expiry, cvc } = cardData;

      if (!number || !name || !expiry || !cvc) {
        setMessage("Please fill all card details!");
        return;
      }
    } else if (paymentMethod === "paypal") {
      if (!paypalEmail) {
        setMessage("Enter PayPal email!");
        return;
      }
      if (!isValidEmail(paypalEmail)) {
        setMessage("Enter a valid PayPal email!");
        return;
      }
    } else if (paymentMethod === "google-pay") {
      if (!googlePayEmail) {
        setMessage("Enter Google Pay email!");
        return;
      }
      if (!isValidEmail(googlePayEmail)) {
        setMessage("Enter a valid Google Pay email!");
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

        setMessage("Payment successful! Order placed. Check your email for the receipt.");
        setLoading(false);
        setTimeout(() => navigate("/Orders"), 1500);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setMessage("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="payment-fullscreen">
      <div className="payment-wrapper">
        {/* Header */}
        <div className="payment-header">
          <div className="payment-logo">PBS ELECTRICAL</div>
        </div>

        {/* <div className="payment-breadcrumb">
          <span className="breadcrumb-item">Cart</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Payment</span>
        </div> */}

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
                        type="date"
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

            {message && (
              <div className={`payment-message ${message.includes("successful") ? "success" : "error"}`}>
                {message}
              </div>
            )}

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
      </div>
    </div>
  );
};

export default Payment;