import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ cartCount = 0, wishlistCount = 0 }) => {  // Accept props for dynamic counts
  return (
    <nav className="navbar">
      <div className="logo">PBS Electrical Solutions.</div>
      <div className="nav-links">
        <Link to="/Home" className="nav-btn">Home</Link>
        <Link to="/ProductPage" className="nav-btn">Products</Link>
        <Link to="/Wishlist" className="nav-btn">
          Wishlist
          {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
        </Link>
        <Link to="/Cart" className="nav-btn">
          Cart
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>
        <Link to="/profile" className="nav-btn">Profile</Link>
      </div>
    </nav>
  );
};

export default Navbar;