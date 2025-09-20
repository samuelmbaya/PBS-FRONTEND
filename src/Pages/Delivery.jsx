import React, { useState } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';

const Delivery = ({ onDeliveryData }) => {
  const navigate = useNavigate();

  const [deliveryData, setDeliveryData] = useState({
    country: '',
    name: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    postalCode: '',
    city: '',
    province: '',
    phoneNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...deliveryData,
      [name]: value
    };
    
    setDeliveryData(updatedData);

    if (onDeliveryData) {
      onDeliveryData(updatedData);
    }
  };

  const handleContinueToPayment = async () => {
    const requiredFields = [
      'country',
      'name',
      'lastName',
      'streetAddress',
      'city',
      'province',
      'phoneNumber'
    ];
    const missingFields = requiredFields.filter(field => !deliveryData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user info
      const storedUser = localStorage.getItem("user");
      let userId = "guest_user";
      let userEmail = "guest@example.com";
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id || parsedUser._id || parsedUser.email;
          userEmail = parsedUser.email || "guest@example.com";
        } catch (e) {
          console.warn("Could not parse stored user data");
        }
      }

      // Get cart items from localStorage
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const totalAmount = parseFloat(localStorage.getItem('cartTotal') || '0');

      // Prepare items for order
      let orderItems = [];
      if (cartItems.length > 0) {
        orderItems = cartItems.map(item => ({
          _id: item._id || item.id || Date.now().toString(),
          productId: item._id || item.id || "unknown",
          name: item.name || "Unknown Product",
          quantity: item.quantity || 1,
          price: item.price || 0,
          imageURL: item.imageURL || item.imageUrl || "https://via.placeholder.com/80"
        }));
      } else {
        // Create a placeholder item if cart is empty
        orderItems = [{
          _id: "placeholder_" + Date.now(),
          productId: "placeholder-item",
          name: "Order Item",
          quantity: 1,
          price: totalAmount || 0,
          imageURL: "https://via.placeholder.com/80"
        }];
      }

      // Create order data
      const orderData = {
        id: "ORD_" + Date.now(),
        _id: "ORD_" + Date.now(),
        userId: userId,
        items: orderItems,
        totalAmount: totalAmount || 0,
        total: totalAmount || 0,
        status: "pending",
        deliveryData: deliveryData,
        paymentMethod: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        date: new Date().toLocaleDateString()
      };

      // Save current order data
      localStorage.setItem('currentOrderId', orderData.id);
      localStorage.setItem('currentOrderData', JSON.stringify(orderData));
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));

      // Save to user's order history in localStorage
      try {
        const existingOrders = JSON.parse(
          localStorage.getItem(`orders_${userEmail}`) || "[]"
        );
        
        // Add the new order to the beginning of the array (most recent first)
        existingOrders.unshift(orderData);
        localStorage.setItem(`orders_${userEmail}`, JSON.stringify(existingOrders));
        
        console.log("Order saved to user history:", orderData);
      } catch (e) {
        console.warn("Could not save to user order history:", e);
      }

      // Also save to a general orders list (for admin purposes or backup)
      try {
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        allOrders.unshift(orderData);
        localStorage.setItem('allOrders', JSON.stringify(allOrders));
      } catch (e) {
        console.warn("Could not save to general orders:", e);
      }

      console.log("Order saved locally:", orderData);

      // Show success message
      alert("Delivery information saved successfully! Proceeding to payment.");

      // Call callback if provided
      if (onDeliveryData) {
        onDeliveryData(deliveryData, true);
      }

      // Navigate to payment
      navigate('/payment');

    } catch (error) {
      console.error("Error saving delivery data:", error);
      
      // Still save the delivery data even if something fails
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
      
      alert("Error processing order, but delivery data has been saved. You can continue to payment.");
      
      // Still allow navigation
      if (onDeliveryData) {
        onDeliveryData(deliveryData, true);
      }
      navigate('/payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="delivery-section dark">
      <div className="delivery-header">
        <h2>Delivery</h2>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
          (Working in offline mode - data saved locally)
        </p>
      </div>

      <div className="shipping-address">
        <h3>Shipping Address</h3>

        <div className="form-group">
          <input
            type="text"
            name="country"
            placeholder="Country/Region"
            value={deliveryData.country}
            onChange={handleInputChange}
            className="form-input full-width"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={deliveryData.name}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group half-width">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={deliveryData.lastName}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="streetAddress"
            placeholder="Street and house number"
            value={deliveryData.streetAddress}
            onChange={handleInputChange}
            className="form-input full-width"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="apartment"
            placeholder="Apartment, suite, etc. (optional)"
            value={deliveryData.apartment}
            onChange={handleInputChange}
            className="form-input full-width"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row three-cols">
          <div className="form-group">
            <input
              type="text"
              name="postalCode"
              placeholder="Postal Code"
              value={deliveryData.postalCode}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={deliveryData.city}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={deliveryData.province}
              onChange={handleInputChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={deliveryData.phoneNumber}
            onChange={handleInputChange}
            className="form-input full-width"
            disabled={isSubmitting}
          />
        </div>

        <div className="return-to-cart">
          <a href="/cart" className="return-link">← Return to Cart</a>
        </div>
      </div>

      <div className="continue-section">
        <button 
          className="continue-btn"
          onClick={handleContinueToPayment}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Continue To Payment'}
        </button>
      </div>
    </div>
  );
};

export default Delivery;