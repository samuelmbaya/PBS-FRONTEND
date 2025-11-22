import React, { useState } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

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

      // Load cart from correct localStorage key
      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || '[]');
      
      // Calculate total from actual cart
      const totalAmount = userCart.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1), 
        0
      );

      // Map cart items with explicit imageUrl
      const orderItems = userCart.map(item => ({
        _id: item._id || item.id || Date.now().toString(),
        productId: item._id || item.id || "unknown",
        name: item.name || "Unknown Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        imageUrl: item.imageUrl || item.imageURL || item.image || "https://via.placeholder.com/80"
      }));

      // Save delivery data for payment page
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
    <div className="delivery-page-container">
      <Navbar />

      {/* Hero Section */}
      <section className="delivery-hero">
        <div className="delivery-hero-content">
          <h1 className="delivery-hero-title">Delivery Information</h1>
          <p className="delivery-hero-subtitle">
            Enter your delivery details to complete your order
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="delivery-content">
        <div className="delivery-form-card">
          <h2 className="form-section-title">Shipping Address</h2>

          <div className="delivery-form">
            <div className="form-group">
              <label className="form-label">Country / Region</label>
              <input
                type="text"
                name="country"
                placeholder="South Africa"
                value={deliveryData.country}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John"
                  value={deliveryData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={deliveryData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="streetAddress"
                placeholder="123 Main Street"
                value={deliveryData.streetAddress}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                name="apartment"
                placeholder="Apartment 4B"
                value={deliveryData.apartment}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-row three-cols">
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="2000"
                  value={deliveryData.postalCode}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Johannesburg"
                  value={deliveryData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Province</label>
                <input
                  type="text"
                  name="province"
                  placeholder="Gauteng"
                  value={deliveryData.province}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+27 12 345 6789"
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
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                'Continue To Payment'
              )}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Delivery;