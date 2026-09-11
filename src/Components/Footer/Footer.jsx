import { useState, useEffect } from "react";
import axios from "axios";
import "./Footer.css";
import logo from "../../assets/syam.png";
import Razorpay from "../../assets/razorpay.png";

import PlayStore from "../../assets/PlayStore.png";
import AppStore from "../../assets/AppStore.png";
import {
  FaChevronDown,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShippingFast,
  FaLock,
  FaHeadset,
  FaMoneyBillWave,
  FaTag,
  FaRegCopy,
  FaCheck,
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaWhatsapp,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import { FiGift } from "react-icons/fi";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

const LATEST_CATEGORY_LIMIT = 5;

const FALLBACK_OFFER_MESSAGE = "Freshly baked daily & delivered with care — order now!";

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

const TRUST_FEATURES = [
  { icon: FaShippingFast, title: "Fast Delivery", subtitle: "Within 45 minutes" },
  { icon: FaMoneyBillWave, title: "Return & Refund", subtitle: "Money back guarantee" },
  { icon: FaLock, title: "Secure Payments", subtitle: "100% secure checkout" },
  { icon: FaHeadset, title: "24/7 Support", subtitle: "We're here to help" },
];

const describeCoupon = (coupon) => {
  if (!coupon) return "";
  const discountPart =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;
  const minOrderPart = coupon.minOrderAmount ? ` on orders above ₹${coupon.minOrderAmount}` : "";
  return `${discountPart}${minOrderPart}`;
};

const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("");

  const [latestCategories, setLatestCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [offerCoupon, setOfferCoupon] = useState(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

  const [openSections, setOpenSections] = useState({
    categories: false,
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

  useEffect(() => {
    axios
      .get(`${BASE_URL}/coupons`)
      .then((res) => {
        const data = res.data;
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.coupons)) list = data.coupons;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (data?.data && typeof data.data === "object") list = [data.data];

        const today = new Date().setHours(0, 0, 0, 0);
        const active = list.filter((c) => {
          if (c.isActive === false) return false;
          if (c.expiryDate && new Date(c.expiryDate) < today) return false;
          return true;
        });

        setOfferCoupon(active[0] || null);
      })
      .catch((err) => {
        console.error("Footer offer fetch error:", err);
        setOfferCoupon(null);
      })
      .finally(() => setOfferLoading(false));
  }, []);

  const handleCopyCode = () => {
    if (!offerCoupon?.code) return;
    navigator.clipboard
      .writeText(offerCoupon.code)
      .then(() => {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      })
      .catch(() => { });
  };

  return (
    <div className="footer" id="footer">
      <div className="footer-offer-patti">
        {offerLoading ? (
          <div className="footer-offer-patti-content">
            <FaTag className="offer-patti-icon" />
            <span className="offer-patti-text">Checking today's offers…</span>
          </div>
        ) : offerCoupon ? (
          <div className="footer-offer-patti-content">
            <FiGift className="offer-patti-icon" />
            <span className="offer-patti-text">{describeCoupon(offerCoupon)}</span>
            <span className="offer-patti-divider">•</span>
            <span className="offer-patti-code-label">Use code</span>
            <button type="button" className="offer-patti-code-chip" onClick={handleCopyCode}>
              {offerCoupon.code}
              {codeCopied ? <FaCheck /> : <FaRegCopy />}
            </button>
          </div>
        ) : (
          <div className="footer-offer-patti-content">
            <FaTag className="offer-patti-icon" />
            <span className="offer-patti-text">{FALLBACK_OFFER_MESSAGE}</span>
          </div>
        )}
      </div>

      <div className="footer-features-bar">
        {TRUST_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div className="footer-feature-item" key={feature.title}>
              <span className="footer-feature-icon">
                <Icon />
              </span>
              <div>
                <p className="footer-feature-title">{feature.title}</p>
                <p className="footer-feature-subtitle">{feature.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="footer-content">
        <div className="footer-content-left">
          <img src={logo} alt="Shyam Foods" className="footer-logo" />
          <p>Freshly baked, delivered with care. Quality you can taste in every bite.</p>
        </div>

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
                  <Link to={`/category/${encodeURIComponent(cat.name || cat.title)}`} state={{ category: cat }}>
                    {cat.name || cat.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

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
            <li><FaPhoneAlt className="footer-inline-icon" /><span>+91 70805 12292</span></li>
            <li><FaEnvelope className="footer-inline-icon" /><span>shyamfoods@gmail.com</span></li>
            <li><FaMapMarkerAlt className="footer-inline-icon" /><span>Lucknow — Office | Store | Workshop</span></li>
          </ul>
        </div>

        <div className="footer-content-follow">
          <h2 className="footer-follow-heading">Follow Us</h2>
          <p className="footer-follow-text">Stay updated with our latest bakes & offers</p>
          <div className="footer-social-icons">
            <a href="" target="_self" rel="self" aria-label="Facebook" className="icon-facebook">
              <FaFacebookF />
            </a>
            <a href="" target="_self" rel="self" aria-label="Instagram" className="icon-instagram">
              <FaInstagram />
            </a>
            <a href="" target="_self" rel="self" aria-label="Pinterest" className="icon-pinterest">
              <FaPinterestP />
            </a>
            <a onClick={() => openPopup("WhatsApp Inquiry")} aria-label="WhatsApp" style={{ cursor: "pointer" }} className="icon-whatsapp">
              <FaWhatsapp />
            </a>
          </div>

          <div className="payment">
            <span className="payment-label">Payment By</span>
            <a href="" target="_self" rel="self" aria-label="Razorpay" className="icon-facebook">
              <img src={Razorpay} alt="Razorpay" />
            </a>
          </div>

          <div className="apps">
            <span className="payment-label">Get Our App</span>
            <a href="" target="_self" rel="self" aria-label="PlayStore" className="icon-facebook">
              <img src={PlayStore} alt="PlayStore" />
            </a>
            <a href="" target="_self" rel="self" aria-label="AppStore" className="icon-instagram">
              <img src={AppStore} alt="AppStore" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          Copyright 2025 © Shyam Foods. All Rights Reserved.
        </p>

        <p className="footer-copyright">Powered by Kuicqli.</p>

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
    const whatsappNumber = "917080512292";
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