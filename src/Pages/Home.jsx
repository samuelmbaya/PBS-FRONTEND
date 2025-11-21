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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;