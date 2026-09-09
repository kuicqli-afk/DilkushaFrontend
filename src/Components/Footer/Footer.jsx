import { useState, useEffect } from "react";
import axios from "axios";
import "./Footer.css";
import facebook from "../../assets/facebook_icon.png";
import instagram from "../../assets/instagram_icon.png";
import pinterest from "../../assets/pintrest_icon.png";
import whatsapp from "../../assets/whatsapp_icon.png";
import logo from "../../assets/syam.png";
import { FaChevronDown, FaTimes, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

import { Link } from "react-router-dom";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

// 🆕 How many categories to show in the footer — change this one number
// to show more/fewer (e.g. LATEST_CATEGORY_LIMIT = 8).
const LATEST_CATEGORY_LIMIT = 5;

// 🆕 "Latest" = most recently created. Uses createdAt if the API sends it;
// otherwise falls back to decoding the timestamp baked into a MongoDB
// ObjectId (first 8 hex chars), so this works even if createdAt is missing.
const getCategoryTimestamp = (cat) => {
  if (cat.createdAt) {
    const t = new Date(cat.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  const id = cat._id;
  if (typeof id === "string" && id.length >= 8) {
    const seconds = parseInt(id.substring(0, 8), 16);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  return 0;
};

const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");

  // 🆕 latest categories for the footer column
  const [latestCategories, setLatestCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    categories: false, // 🆕
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

  // 🆕 Fetch categories once, sort newest-first, keep only the top N
  useEffect(() => {
    axios
      .get(`${BASE_URL}/category/categories`)
      .then((res) => {
        const list = res.data?.data || res.data?.categories || res.data || [];
        const sorted = (Array.isArray(list) ? list : [])
          .slice()
          .sort((a, b) => getCategoryTimestamp(b) - getCategoryTimestamp(a));
        setLatestCategories(sorted.slice(0, LATEST_CATEGORY_LIMIT));
      })
      .catch((err) => {
        console.error("Footer categories fetch error:", err);
        setLatestCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        {/* BRAND COLUMN */}
        <div className="footer-content-left">
          <img src={logo} alt="Shyam Foods" className="footer-logo" />
          <p>Freshly baked, delivered with care. Quality you can taste in every bite.</p>
        </div>

        {/* 🆕 CATEGORIES COLUMN — collapsible, latest 5, shown before Company */}
        <div className="footer-content-categories">
          <button
            type="button"
            className="footer-section-toggle"
            onClick={() => toggleSection("categories")}
          >
            <h2>Menus</h2>
            <FaChevronDown className={`footer-arrow ${openSections.categories ? "open" : ""}`} />
          </button>

          <ul className={`footer-collapsible ${openSections.categories ? "open" : ""}`}>
            {categoriesLoading ? (
              <li>Loading...</li>
            ) : latestCategories.length === 0 ? (
              <li>No categories yet</li>
            ) : (
              latestCategories.map((cat) => (
                <li key={cat._id}>
                  {/* NOTE: adjust this route to match your actual category/listing page */}
                  <Link to={`/category/${encodeURIComponent(cat.name || cat.title)}`} state={{ category: cat }}>
                    {cat.name || cat.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
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
            <li><FaPhoneAlt className="footer-inline-icon" /><span>+91 70842 20734</span></li>
            <li><FaEnvelope className="footer-inline-icon" /><span>info@shyamfoods.com</span></li>
            <li><FaMapMarkerAlt className="footer-inline-icon" /><span>Lucknow — Office | Store | Workshop</span></li>
          </ul>
        </div>

        {/* FOLLOW US COLUMN — social icons */}
        <div className="footer-content-follow">
          <h2 className="footer-follow-heading">Follow Us</h2>
          <p className="footer-follow-text">Stay updated with our latest bakes & offers</p>
          <div className="footer-social-icons">
            <a href="#" target="_self" rel="self" aria-label="Facebook" className="icon-facebook">
              <img src={facebook} alt="Facebook" />
            </a>
            <a href="#" target="_self" rel="self" aria-label="Instagram" className="icon-instagram">
              <img src={instagram} alt="Instagram" />
            </a>
            <a href="#" target="_self" rel="self" aria-label="Pinterest" className="icon-pinterest">
              <img src={pinterest} alt="Pinterest" />
            </a>
            <a onClick={() => openPopup("WhatsApp Inquiry")} aria-label="WhatsApp" style={{ cursor: "pointer" }} className="icon-whatsapp">
              <img src={whatsapp} alt="WhatsApp" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          Copyright 2025 © Shyam Foods. All Rights Reserved.
        </p>
        <p className="footer-credit">
          Design and Developed by{" "}
          <a href="https://designerbirds.com/" target="_blank" rel="noreferrer">
            Designerbirds Team
          </a>
        </p>
      </div>

      {showPopup && <PopupForm type={popupType} onClose={() => setShowPopup(false)} />}
    </div>
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