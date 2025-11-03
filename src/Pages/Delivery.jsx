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
      // 🟢 Get user info
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

      // 🟢 Cart info
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const totalAmount = parseFloat(localStorage.getItem('cartTotal') || '0');

      const orderItems = (cartItems.length > 0 ? cartItems : [{
        _id: "placeholder_" + Date.now(),
        productId: "placeholder-item",
        name: "Order Item",
        quantity: 1,
        price: totalAmount || 0,
        imageURL: "https://via.placeholder.com/80"
      }]).map(item => ({
        _id: item._id || item.id || Date.now().toString(),
        productId: item._id || item.id || "unknown",
        name: item.name || "Unknown Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        imageURL: item.imageURL || item.imageUrl || "https://via.placeholder.com/80"
      }));

      const orderData = {
        id: "ORD_" + Date.now(),
        userId,
        items: orderItems,
        totalAmount,
        status: "pending",
        deliveryData,
        paymentMethod: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        date: new Date().toLocaleDateString()
      };

      // 🟢 Save to backend
      try {
        const response = await fetch(`${apiUrl}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) throw new Error(`Failed to save order: ${response.statusText}`);

        const savedOrder = await response.json();
        console.log("✅ Order saved to backend:", savedOrder);
      } catch (err) {
        console.warn("⚠️ Could not save to backend, saving locally instead:", err);

        const existingOrders = JSON.parse(localStorage.getItem(`orders_${userEmail}`) || "[]");
        existingOrders.unshift(orderData);
        localStorage.setItem(`orders_${userEmail}`, JSON.stringify(existingOrders));
      }

      // 🟢 Store locally
      localStorage.setItem('currentOrderId', orderData.id);
      localStorage.setItem('currentOrderData', JSON.stringify(orderData));
      localStorage.setItem('deliveryData', JSON.stringify(deliveryData));

      alert("Delivery information saved successfully! Proceeding to payment.");
      if (onDeliveryData) onDeliveryData(deliveryData, true);
      navigate('/payment');
    } catch (error) {
      console.error("Error saving delivery data:", error);
      alert("Error processing order. Delivery data saved locally. You can continue to payment.");
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
          (Data will sync to backend if online, otherwise saved locally)
        </p>
      </div>

      {/* 🟢 Delivery Form */}
      <div className="delivery-form">
        {[
          { label: 'Country', name: 'country' },
          { label: 'First Name', name: 'name' },
          { label: 'Last Name', name: 'lastName' },
          { label: 'Street Address', name: 'streetAddress' },
          { label: 'Apartment', name: 'apartment' },
          { label: 'Postal Code', name: 'postalCode' },
          { label: 'City', name: 'city' },
          { label: 'Province', name: 'province' },
          { label: 'Phone Number', name: 'phoneNumber' }
        ].map((field, index) => (
          <div className="form-group" key={index}>
            <label>{field.label}</label>
            <input
              type="text"
              name={field.name}
              value={deliveryData[field.name]}
              onChange={handleInputChange}
              required={['country','name','lastName','streetAddress','city','province','phoneNumber'].includes(field.name)}
            />
          </div>
        ))}
      </div>

      {/* 🟢 Continue Button */}
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
