import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "./Home.css";

const Home = () => {
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

          <Link to="/ProductPage" className="hero-link">
            <button className="shop-btn">SHOP NOW</button>
          </Link>
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

          <div className="aboutSection">
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

        <div className="contact-right">
          <form className="contactForm">
            <h3>Contact Us</h3>

            <div className="formRow">
              <div className="formGroup">
                <label>First name</label>
                <input type="text" placeholder="Jane" />
              </div>
              <div className="formGroup">
                <label>Last name</label>
                <input type="text" placeholder="Smitherton" />
              </div>
            </div>

            <div className="formGroup">
              <label>Email address</label>
              <input type="email" placeholder="email@janesfakedomain.net" />
            </div>

            <div className="formGroup">
              <label>Your message</label>
              <textarea placeholder="Enter your question or message" rows="5"></textarea>
            </div>

            <button type="submit" className="submitButton">
              Submit
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;