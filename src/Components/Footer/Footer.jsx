import { useState } from "react";
import "./Footer.css";
import facebook from "../../assets/facebook_icon.png";
import instagram from "../../assets/instagram_icon.png";
import pinterest from "../../assets/pintrest_icon.png";
import whatsapp from "../../assets/whatsapp_icon.png";
import logo from "../../assets/syam.png";
import { FaChevronDown, FaTimes, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

import { Link } from "react-router-dom";

const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");

  // company & contact accordion sections start closed on mobile,
  // CSS keeps them always-open on desktop regardless of this state
  const [openSections, setOpenSections] = useState({
    company: false,
    contact: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openPopup = (type) => {
    setPopupType(type);
    setShowPopup(true);
  };

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* BRAND COLUMN */}
        <div className="footer-content-left">
          <img src={logo} alt="Shyam Foods" className="footer-logo" />
          <p>Freshly baked, delivered with care. Quality you can taste in every bite.</p>
        </div>

        {/* COMPANY COLUMN — collapsible */}
        <div className="footer-content-center">
          <button
            type="button"
            className="footer-section-toggle"
            onClick={() => toggleSection("company")}
          >
            <h2>Company</h2>
            <FaChevronDown className={`footer-arrow ${openSections.company ? "open" : ""}`} />
          </button>

          <ul className={`footer-collapsible ${openSections.company ? "open" : ""}`}>
            <li><Link to="">Contact Us</Link></li>
            <li><Link to="">Terms and Conditions</Link></li>
            <li><Link to="">Privacy Policy</Link></li>
            <li><Link to="">Shipping and Delivery</Link></li>
          </ul>
        </div>

        {/* GET IN TOUCH COLUMN — collapsible */}
        <div className="footer-content-right">
          <button
            type="button"
            className="footer-section-toggle"
            onClick={() => toggleSection("contact")}
          >
            <h2>Get In Touch</h2>
            <FaChevronDown className={`footer-arrow ${openSections.contact ? "open" : ""}`} />
          </button>

          <ul className={`footer-collapsible ${openSections.contact ? "open" : ""}`}>
            <li><FaPhoneAlt className="footer-inline-icon" /> +91 70842 20734</li>
            <li><FaEnvelope className="footer-inline-icon" /> info@shyamfoods.com</li>
            <li><FaMapMarkerAlt className="footer-inline-icon" /> Lucknow — Office | Store | Workshop</li>
          </ul>
        </div>

        {/* FOLLOW US COLUMN — social icons */}
        <div className="footer-content-follow">
          <h2 className="footer-follow-heading">Follow Us</h2>
          <div className="footer-social-icons">
            <a href="#" target="_self" rel="self" aria-label="Facebook">
              <img src={facebook} alt="Facebook" />
            </a>
            <a href="#" target="_self" rel="self" aria-label="Instagram">
              <img src={instagram} alt="Instagram" />
            </a>
            <a href="#" target="_self" rel="self" aria-label="Pinterest">
              <img src={pinterest} alt="Pinterest" />
            </a>
            <a onClick={() => openPopup("WhatsApp Inquiry")} aria-label="WhatsApp" style={{ cursor: "pointer" }}>
              <img src={whatsapp} alt="WhatsApp" />
            </a>
          </div>
        </div>
      </div>

      <p className="footer-copyright">
        Copyright 2025 © - All Rights Reserved. -{" "}

        <a style={{ fontWeight: "500", textDecoration: "none", color: "#334155" }}
          href="https://designerbirds.com/"
          target="_blank"
          rel="noreferrer"
        >
          Design and Developed by Designerbirds Team
        </a>
      </p>

      {showPopup && <PopupForm type={popupType} onClose={() => setShowPopup(false)} />}
    </div >
  );
};

const PopupForm = ({ type, onClose }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [yourQuery, setOrderDetails] = useState("");

  const sendToWhatsApp = (e) => {
    e.preventDefault();
    if (!name || !phone || !yourQuery) {
      alert("Please fill all fields!");
      return;
    }
    const whatsappNumber = "917084220734";
    const message = `*New ${type} Request*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📝 Your Query: ${yourQuery}`;
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{type} Form</h2>
          <button type="button" className="popup-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <h3>Kindly share your query with us.</h3>
        <form onSubmit={sendToWhatsApp}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
          <label>Your Query</label>
          <textarea
            value={yourQuery}
            onChange={(e) => setOrderDetails(e.target.value)}
            placeholder="Describe your query"
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Footer;