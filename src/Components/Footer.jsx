import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">BRAND</div>
        
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
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#team">Team</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-copyright">
          <p>© 2024 Brand Name | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;