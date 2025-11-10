import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar"; // ✅ Import the new Navbar component
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch featured products");
        const data = await response.json();
        setFeaturedProducts(data);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="home-container">
      {/* ✅ Navbar Component */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>SOUTH AFRICAN ENERGY SUPPLIERS</h1>
          <p>
            <strong>Powered By Samuel</strong> is a company that provides
            affordable and clean energy solutions to homes and businesses in
            South Africa...
          </p>
          <Link to="/ProductPage">
            <button className="shop-btn">SHOP NOW</button>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <h2>Featured Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : featuredProducts.length === 0 ? (
          <p>No featured products available.</p>
        ) : (
          <div className="featured-grid">
            {featuredProducts.map((product) => (
              <div key={product._id} className="featured-card">
                <img
                  src={product.imageURL || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="featured-image"
                />
                <h3>{product.name}</h3>
                <p>R {product.price?.toLocaleString() || "N/A"}</p>
                <Link to="/ProductPage">
                  <button className="view-btn">View Product</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Powered By Samuel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
