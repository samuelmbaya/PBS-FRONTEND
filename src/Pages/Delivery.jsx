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
    setDeliveryData(prev => ({
      ...prev,
      [name]: value
    }));

    if (onDeliveryData) {
      onDeliveryData({
        ...deliveryData,
        [name]: value
      });
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
      const orderPayload = {
        userId: localStorage.getItem('userId') || "guest_user",
        items: [
          {
            productId: "delivery-info-placeholder",
            quantity: 1,
            deliveryInfo: deliveryData
          }
        ],
        totalAmount: 0, // placeholder value allowed on backend now
        status: "pending"
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      let result;
      try {
        result = await response.json(); // always parse JSON
      } catch (err) {
        throw new Error(`Invalid JSON response (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Order created successfully:", result);

      localStorage.setItem('currentOrderId', result.data._id);
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));

    } catch (error) {
      console.error("Error saving delivery data:", error);

      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));
      console.log("Delivery data saved locally as fallback");

      alert(`Note: Could not save delivery info to server (${error.message}), but data is saved locally.`);
    }

    if (onDeliveryData) {
      onDeliveryData(deliveryData, true);
    }

    setIsSubmitting(false);
    navigate('/payment');
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
