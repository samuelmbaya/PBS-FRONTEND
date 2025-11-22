import React, { useState, useEffect, useRef } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Delivery = ({ onDeliveryData }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Country data with flags and dial codes
  const countries = [
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20' },
    { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256' },
    { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212' },
    { code: 'DZ', name: 'Algeria', flag: '🇩🇿', dialCode: '+213' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
    { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
    { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966' },
  ];

  const [deliveryData, setDeliveryData] = useState({
    country: 'ZA',
    countryName: 'South Africa',
    name: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    postalCode: '',
    city: '',
    province: '',
    phoneNumber: '+27 '
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const selectedCountry = countries.find(c => c.code === deliveryData.country) || countries[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...deliveryData, [name]: value };
    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handleCountrySelect = (country) => {
    const updatedData = { 
      ...deliveryData, 
      country: country.code,
      countryName: country.name,
      phoneNumber: country.dialCode + ' '
    };
    setDeliveryData(updatedData);
    setShowCountryDropdown(false);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    const updatedData = { ...deliveryData, phoneNumber: value };
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

    const phoneDigits = deliveryData.phoneNumber.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem("user");
      let userEmail = "guest@example.com";

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userEmail = parsedUser.email || "guest@example.com";
        } catch {
          console.warn("Could not parse stored user data");
        }
      }

      const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || '[]');
      
      const totalAmount = userCart.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1), 
        0
      );

      const orderItems = userCart.map(item => ({
        _id: item._id || item.id || Date.now().toString(),
        productId: item._id || item.id || "unknown",
        name: item.name || "Unknown Product",
        quantity: item.quantity || 1,
        price: item.price || 0,
        imageUrl: item.imageUrl || item.imageURL || item.image || "https://via.placeholder.com/80"
      }));

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

      <section className="delivery-hero">
        <div className="delivery-hero-content">
          <h1 className="delivery-hero-title">Delivery Information</h1>
          <p className="delivery-hero-subtitle">
            Enter your delivery details to complete your order
          </p>
        </div>
      </section>

      <div className="delivery-content">
        <div className="delivery-form-card">
          <h2 className="form-section-title">Shipping Address</h2>

          <div className="delivery-form">
            {/* Country Selector with Flags */}
            <div className="form-group">
              <label className="form-label">Country / Region</label>
              <div className="country-selector" ref={dropdownRef}>
                <button
                  type="button"
                  className="country-select-btn"
                  onClick={() => {
                    console.log('Dropdown clicked, current state:', showCountryDropdown);
                    setShowCountryDropdown(!showCountryDropdown);
                  }}
                >
                  <span className="country-flag">{selectedCountry.flag}</span>
                  <span className="country-name">{selectedCountry.name}</span>
                  <span className="dropdown-arrow">{showCountryDropdown ? '▲' : '▼'}</span>
                </button>
                
                {showCountryDropdown && (
                  <div className="country-dropdown">
                    <div className="country-dropdown-scroll">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          className={`country-option ${country.code === deliveryData.country ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('Country selected:', country.name);
                            handleCountrySelect(country);
                          }}
                        >
                          <span className="country-flag">{country.flag}</span>
                          <span className="country-name">{country.name}</span>
                          <span className="country-dial-code">{country.dialCode}</span>
                          {country.code === deliveryData.country && (
                            <span className="check-mark">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                placeholder="Apartment 4B, Unit 2"
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

            {/* Phone Number with Flag */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="phone-input-wrapper">
                <div className="phone-prefix">
                  <span className="phone-flag">{selectedCountry.flag}</span>
                  <span className="phone-code">{selectedCountry.dialCode}</span>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="12 345 6789"
                  value={deliveryData.phoneNumber}
                  onChange={handlePhoneChange}
                  className="form-input phone-input"
                  required
                />
              </div>
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