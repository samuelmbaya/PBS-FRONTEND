import React, { useState } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';

const Delivery = ({ onDeliveryData }) => {
  const navigate = useNavigate();
  const apiUrl = "http://44.198.25.29:3000";

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
    const updatedData = { ...deliveryData, [name]: value };
    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handleContinueToPayment = async () => {
    const requiredFields = [
      'country', 'name', 'lastName', 'streetAddress', 'city', 'province', 'phoneNumber'
    ];
    const missingFields = requiredFields.filter(field => !deliveryData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem("user");
      let userId = "guest_user";
      let userEmail = "guest@example.com";

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id || parsedUser._id || parsedUser.email;
          userEmail = parsedUser.email || "guest@example.com";
        } catch {
          console.warn("Could not parse stored user data");
        }
      }

      // ✅ FIXED: Load cart from correct localStorage key
      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || '[]');
      
      // ✅ Calculate total from actual cart
      const totalAmount = userCart.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1), 
        0
      );

      // ✅ FIXED: Map cart items with explicit imageUrl
      const orderItems = userCart.map(item => ({
        _id: item._id || item.id || Date.now().toString(),
        productId: item._id || item.id || "unknown",
        name: item.name || "Unknown Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        imageUrl: item.imageUrl || item.imageURL || item.image || "https://via.placeholder.com/80" // ✅ Explicitly include imageUrl
      }));

      // Don't create order yet, just save delivery data
      // Payment.jsx will handle order creation
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));

      alert("Delivery information saved successfully! Proceeding to payment.");
      if (onDeliveryData) onDeliveryData(deliveryData, true);
      navigate('/payment');
      
    } catch (error) {
      console.error("Error saving delivery data:", error);
      alert("Error processing delivery data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h1>Delivery</h1>
      </div>

      <div className="delivery-form">
        <div className="form-group">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={deliveryData.country}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="First Name"
            value={deliveryData.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={deliveryData.lastName}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="streetAddress"
            placeholder="Street Address"
            value={deliveryData.streetAddress}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="apartment"
            placeholder="Apartment, suite, etc. (optional)"
            value={deliveryData.apartment}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-row three-cols">
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={deliveryData.postalCode}
            onChange={handleInputChange}
            className="form-input"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={deliveryData.city}
            onChange={handleInputChange}
            className="form-input"
            required
          />
          <input
            type="text"
            name="province"
            placeholder="Province"
            value={deliveryData.province}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={deliveryData.phoneNumber}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="delivery-actions">
        <button 
          className="return-cart-btn"
          onClick={handleReturnToCart}
        >
          Return To Cart
        </button>
        <button 
          className="continue-payment-btn"
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