import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>SOUTH AFRICAN ENERGY SUPPLIERS</h1>
          <p>
            <strong>Powered By Samuel</strong> provides affordable and clean 
            energy solutions to homes and businesses in South Africa...
          </p>

          <Link to="/ProductPage">
            <button className="shop-btn">SHOP NOW</button>
          </Link>
        </div>
      </section>

      {/* You said NO PRODUCTS on Home, so removed the featured products section */}

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Powered By Samuel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
