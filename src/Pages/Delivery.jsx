import React, { useState, useRef, useEffect } from 'react';
import './Delivery.css';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Delivery = ({ onDeliveryData }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
    deliveryMethod: 'delivery',
    name: '',
    lastName: '',
    streetAddress: '',
    apartment: '',
    postalCode: '',
    city: '',
    province: '',
    pickupLocation: '',
    phoneNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const selectedCountry = countries.find(c => c.code === deliveryData.country) || countries[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...deliveryData, [name]: value };
    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handleMethodChange = (e) => {
    const method = e.target.value;
    let updatedData = { ...deliveryData, deliveryMethod: method };

    if (method === 'pickup') {
      // Reset delivery address fields
      updatedData = {
        ...updatedData,
        name: '',
        lastName: '',
        streetAddress: '',
        apartment: '',
        postalCode: '',
        city: '',
        province: ''
      };
    } else {
      // Reset pickup location
      updatedData = { ...updatedData, pickupLocation: '' };
    }

    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    const country = countries.find(c => c.code === countryCode);
    
    if (country) {
      const updatedData = { 
        ...deliveryData, 
        country: country.code,
        countryName: country.name,
        phoneNumber: '' // Reset phone number when country changes
      };
      setDeliveryData(updatedData);
      if (onDeliveryData) onDeliveryData(updatedData);
    }
  };

  const handleCustomCountrySelect = (country) => {
    const updatedData = { 
      ...deliveryData, 
      country: country.code,
      countryName: country.name,
      phoneNumber: '' // Reset phone number when country changes
    };
    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
    setShowCountryDropdown(false);
  };

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCountryDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    
    // Don't allow user to delete the dial code digits
    const dialCodeDigits = selectedCountry.dialCode.replace(/\D/g, '');
    
    // If user tries to delete dial code, prevent it
    if (digits.length < dialCodeDigits.length) {
      digits = dialCodeDigits;
    }
    
    // Format the number with the dial code
    let formattedNumber = selectedCountry.dialCode + ' ';
    
    // Get the digits after the dial code
    const phoneDigits = digits.slice(dialCodeDigits.length);
    
    // Add formatting based on length
    if (phoneDigits.length > 0) {
      // Group digits in chunks of 3 or 2 depending on the number
      if (phoneDigits.length <= 3) {
        formattedNumber += phoneDigits;
      } else if (phoneDigits.length <= 6) {
        formattedNumber += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3);
      } else if (phoneDigits.length <= 9) {
        formattedNumber += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3, 6) + ' ' + phoneDigits.slice(6);
      } else {
        formattedNumber += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3, 6) + ' ' + phoneDigits.slice(6, 10);
      }
    }
    
    const updatedData = { ...deliveryData, phoneNumber: formattedNumber.trim() };
    setDeliveryData(updatedData);
    if (onDeliveryData) onDeliveryData(updatedData);
  };

  const handleContinueToPayment = async () => {
    let requiredFields = [];
    if (deliveryData.deliveryMethod === 'delivery') {
      requiredFields = ['name', 'lastName', 'streetAddress', 'city', 'province', 'phoneNumber'];
    } else {
      requiredFields = ['pickupLocation', 'phoneNumber'];
    }

    const missingFields = requiredFields.filter(field => !deliveryData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate phone number length (should have at least 9 digits after dial code)
    const phoneDigits = deliveryData.phoneNumber.replace(/\D/g, '');
    const dialCodeDigits = selectedCountry.dialCode.replace(/\D/g, '');
    const actualPhoneDigits = phoneDigits.slice(dialCodeDigits.length);
    
    if (actualPhoneDigits.length < 9) {
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

          // Update user profile with delivery data if fields are filled
          const updatedUser = { ...parsedUser };
          if (deliveryData.name.trim()) updatedUser.firstName = deliveryData.name;
          if (deliveryData.lastName.trim()) updatedUser.lastName = deliveryData.lastName;
          if (deliveryData.phoneNumber.trim()) updatedUser.phone = deliveryData.phoneNumber;
          if (deliveryData.country) updatedUser.country = deliveryData.country;
          if (deliveryData.deliveryMethod === 'delivery') {
            if (deliveryData.streetAddress.trim()) updatedUser.streetAddress = deliveryData.streetAddress;
            if (deliveryData.apartment.trim()) updatedUser.apartment = deliveryData.apartment;
            if (deliveryData.postalCode.trim()) updatedUser.postalCode = deliveryData.postalCode;
            if (deliveryData.city.trim()) updatedUser.city = deliveryData.city;
            if (deliveryData.province.trim()) updatedUser.province = deliveryData.province;
          }
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch {
          console.warn("Could not parse stored user data");
        }
      }

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
          <h2 className="form-section-title">
            {deliveryData.deliveryMethod === 'delivery' ? 'Shipping Address' : 'Pickup Information'}
          </h2>

          <div className="delivery-form">
            {/* Country Selector - Custom Dropdown */}
            <div className="form-group">
              <label className="form-label">Country / Region</label>
              <div className="country-selector" ref={dropdownRef}>
                <button
                  type="button"
                  className="country-select-btn form-input"
                  onClick={toggleCountryDropdown}
                >
                  <span className="country-flag">{selectedCountry.flag}</span>
                  <span className="country-name">{selectedCountry.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showCountryDropdown && (
                  <div className="country-dropdown">
                    <div className="country-dropdown-scroll">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          className={`country-option ${deliveryData.country === country.code ? 'selected' : ''}`}
                          onClick={() => handleCustomCountrySelect(country)}
                        >
                          <span className="country-flag">{country.flag}</span>
                          <span className="country-name">{country.name}</span>
                          <span className="country-dial-code">{country.dialCode}</span>
                          {deliveryData.country === country.code && <span className="check-mark">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Method Selector */}
            <div className="form-group">
              <label className="form-label">Delivery Method</label>
              <div className="delivery-method-options">
                <label className="method-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryData.deliveryMethod === 'delivery'}
                    onChange={handleMethodChange}
                  />
                  <span>Delivery to address</span>
                </label>
                <label className="method-option">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryData.deliveryMethod === 'pickup'}
                    onChange={handleMethodChange}
                  />
                  <span>Pickup from store</span>
                </label>
              </div>
            </div>

            {/* Conditional Form Content */}
            {deliveryData.deliveryMethod === 'delivery' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Firstname"
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
                      placeholder="Surname"
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
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">Pickup Location</label>
                <select
                  name="pickupLocation"
                  value={deliveryData.pickupLocation}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select a pickup location</option>
                  <option value="main-store">Main Store - {selectedCountry.name}</option>
                  <option value="downtown-branch">Downtown Branch - {selectedCountry.name}</option>
                  <option value="outlet-center">Outlet Center - {selectedCountry.name}</option>
                </select>
              </div>
            )}

            {/* Phone Number with Flag and Auto-formatting */}
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
                  placeholder="123 456 789"
                  value={deliveryData.phoneNumber}
                  onChange={handlePhoneChange}
                  className="form-input phone-input"
                  required
                />
              </div>
              {deliveryData.phoneNumber && (
                <div className="phone-helper-text">
                  Full number: {deliveryData.phoneNumber}
                </div>
              )}
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