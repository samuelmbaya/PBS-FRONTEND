import React, { useState } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';

const Delivery = ({ onDeliveryData }) => {
  const navigate = useNavigate();

  // Use consistent API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://3.87.165.143:3000";

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
      // Get cart items from localStorage or other state management
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const totalAmount = parseFloat(localStorage.getItem('cartTotal') || '0');

      const orderPayload = {
        userId: localStorage.getItem('userId') || "guest_user",
        items: cartItems.length > 0 ? cartItems : [
          {
            productId: "delivery-info-placeholder",
            quantity: 1,
            price: 0
          }
        ],
        totalAmount: totalAmount,
        status: "pending",
        deliveryData: deliveryData // Include delivery data in the order
      };

      console.log('Sending order payload:', orderPayload);

      // FIXED: Changed from /order to /orders to match backend route
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let result;
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Order created successfully:", result);

      // Store order ID and delivery data
      if (result.data && result.data._id) {
        localStorage.setItem('currentOrderId', result.data._id);
      }
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));

      // Call the callback if provided
      if (onDeliveryData) {
        onDeliveryData(deliveryData, true);
      }

      // Navigate to payment
      navigate('/payment');

    } catch (error) {
      console.error("Error saving delivery data:", error);

      // Save delivery data locally as fallback
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
      console.log("Delivery data saved locally as fallback");

      // Show user-friendly error message
      const errorMessage = error.message.includes('fetch') 
        ? 'Unable to connect to server. Please check your internet connection.'
        : `Error: ${error.message}`;

      alert(`Could not save order: ${errorMessage}\n\nDelivery data has been saved locally. You can continue to payment.`);

      // Still allow navigation to payment page
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