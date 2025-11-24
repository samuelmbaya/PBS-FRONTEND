import React from 'react';
import { Link } from "react-router-dom";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">POWERED BY SAMUEL</div>
        
        <div className="footer-social-icons">
          <a href="https://www.instagram.com/_samuel4422/" aria-label="Instagram">
            <i className="bx bxl-instagram"></i>
          </a>
          <a href="https://wa.me/27817118312" aria-label="WhatsApp">
            <i className="bx bxl-whatsapp"></i>
          </a>
          <a href="https://github.com/samuelmbaya" aria-label="GitHub">
            <i className="bx bxl-github"></i>
          </a>
          <a href="https://www.linkedin.com/in/samuel-mbaya-8316b0344/" aria-label="LinkedIn">
            <i className="bx bxl-linkedin"></i>
          </a>
        </div>

        <div className="footer-links">
          <Link to="/Home">Home</Link>
          <Link to="/Home#our-story">About</Link>
          <Link to="/Home#about">Services</Link>
          <Link to="/Home#contact">Contact</Link>
        </div>

        <div className="footer-copyright">
          <p>© 2024 POWERED BY SAMUEL | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;