import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import emailjs from '@emailjs/browser';
import "./Home.css";

const Home = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const loadWishlistCount = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(wishlist.length);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setWishlistCount(0);
      }
    };

    loadWishlistCount();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    // Replace with your EmailJS credentials
    const templateParams = {
      from_name: `${formData.firstName} ${formData.lastName}`,
      from_email: formData.email,
      message: formData.message,
      time: new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }), // SA time
    };

    emailjs.send('service_xtqs246', 'template_7eg8e1i', templateParams, 'aEC3095geTrpzu0k1')
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setStatus('Message sent successfully!');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      }, (error) => {
        console.log('FAILED...', error);
        setStatus('Failed to send message. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Cut through the noise</h1>
          <h2 className="hero-subtitle">SOUTH AFRICAN ENERGY SUPPLIERS</h2>
          <p className="hero-description">
            <strong>Powered By Samuel</strong> provides affordable and clean 
            energy solutions to homes and businesses in South Africa.
          </p>

          <div className="hero-actions">
            <Link to="/ProductPage" className="hero-link">
              <button className="shop-btn">SHOP NOW</button>
            </Link>
            <Link to="/wishlist" className="wishlist-link">
              <button className="wishlist-btn">
                Wishlist
                {wishlistCount > 0 && <span className="wishlist-badge">{wishlistCount}</span>}
                {wishlistCount === 0 && <span className="wishlist-empty">(0)</span>}
              </button>
            </Link>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Product Showcase Sections */}
      <section className="product-section dark solar-bg">
        <div className="product-content">
          <h3 className="product-tagline">Power in perspective</h3>
          <h2 className="product-name">Solar Solutions</h2>
          <Link to="/ProductPage" className="product-link">
            <button className="shop-btn-alt">Shop</button>
          </Link>
        </div>
      </section>

      <section className="product-section light">
        <div className="product-content">
          <h3 className="product-tagline">Energy redefined</h3>
          <h2 className="product-name">Inverter Systems</h2>
          <Link to="/ProductPage" className="product-link">
            <button className="shop-btn-alt">Shop</button>
          </Link>
        </div>
      </section>

      <section className="product-section dark">
        <div className="product-content">
          <h3 className="product-tagline">Sustainable power</h3>
          <h2 className="product-name">Battery Storage</h2>
          <Link to="/ProductPage" className="product-link">
            <button className="shop-btn-alt">Shop</button>
          </Link>
        </div>
      </section>

      {/* Story and Contact Sections */}
      <section className="story-contact-section">
        <div className="story-left">
          <div className="storySection">
            <h3>Our Story</h3>
            <p>
              Powered By Samuel began with a simple idea: to create a space where energy 
              enthusiasts—from homeowners to businesses—can connect, learn, and stay
              in the know. What started as a passion project quickly evolved into a
              growing community of people who love sustainable energy for its history, innovation,
              and impact on South Africa.
            </p>
          </div>

          <div className="aboutSection" id="about">
            <h3>What We're About</h3>
            <p>
              At Powered By Samuel, we cover everything from the hottest solar drops and detailed
              inverter reviews to battery care tips, energy trend forecasts, and sustainable inspiration. Whether
              you're installing your first system or upgrading your fiftieth, we've got something for
              you.
            </p>
          </div>

          <div className="movementSection">
            <h3>Join the Movement</h3>
            <p>
              Sustainable energy isn’t just power—it’s a lifestyle. Be part of something
              bigger. Follow us, explore new solutions, and power up with us.
            </p>
          </div>
        </div>

        <div className="contact-right" id="contact">
          <form className="contactForm" onSubmit={handleSubmit}>
            <h3>Contact Us</h3>

            <div className="formRow">
              <div className="formGroup">
                <label>First name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Name" 
                  required
                />
              </div>
              <div className="formGroup">
                <label>Last name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Surname" 
                  required
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Email address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Email" 
                required
              />
            </div>

            <div className="formGroup">
              <label>Your message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your question or message" 
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="submitButton" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </button>

            {status && <p className={`status-message ${status.includes('success') ? 'success' : 'error'}`}>{status}</p>}
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;