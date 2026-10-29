import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import axios from "axios";
import "./Footer.css";
import logo from "../../assets/dilkusha.png";
import Razorpay from "../../assets/razorpay.webp";

import PlayStore from "../../assets/PlayStore.webp";
import AppStore from "../../assets/AppStore.webp";
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
  FaMobileAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import { FiGift } from "react-icons/fi";
import { StaggerChildren } from "../Motion/motionKit";
import { TextLinesSkeleton } from "../Skeleton/Skeleton";

// Rider popups live in their own chunk; it loads on first hover/focus/click, not with the page
const loadRiderConnect = () => import("./RiderConnect");
const RiderModal = lazy(() => loadRiderConnect().then((m) => ({ default: m.RiderModal })));
const RiderQrModal = lazy(() => loadRiderConnect().then((m) => ({ default: m.RiderQrModal })));

const BASE_URL = "https://dilkushabackend.onrender.com/api";

// Makes a <button> look like the other footer links
const linkButtonStyle = {
  background: "none",
  border: 0,
  padding: 0,
  margin: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  textAlign: "left",
};

const LATEST_CATEGORY_LIMIT = 5;

const FALLBACK_OFFER_MESSAGE = "Freshly prepared daily & delivered with care — order now!";

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
  const [riderPopup, setRiderPopup] = useState(null); // null | "form" | "qr"
  const [appModal, setAppModal] = useState(false); // one popup for both app icons
  const appTriggerRef = useRef(null); // remembers which icon opened the popup, to return focus on close

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

  // Play Store and App Store icons both open the same popup
  const openAppModal = (e) => {
    e.preventDefault();
    appTriggerRef.current = e.currentTarget;
    setAppModal(true);
  };

  const closeAppModal = useCallback(() => {
    setAppModal(false);
    appTriggerRef.current?.focus?.();
  }, []);

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

      <StaggerChildren className="footer-content">
        <div className="footer-content-left">
          <img src={logo} alt="Dilkusha Biryani" className="footer-logo" width="460" height="260" loading="lazy" />
          <p>Freshly prepared, delivered with care. Quality you can taste in every bite.</p>
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
              <li>
                <TextLinesSkeleton lines={4} label="Loading menus" />
              </li>
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
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/shipping-and-delivery">Shipping and Delivery</Link></li>
            <li>
              <button
                type="button"
                style={linkButtonStyle}
                onClick={() => setRiderPopup("qr")}
                onMouseEnter={loadRiderConnect}
                onFocus={loadRiderConnect}
                onTouchStart={loadRiderConnect}
              >
                Become a Riders Partner
              </button>
            </li>
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
            <li><FaPhoneAlt className="footer-inline-icon" /><span>+91 98765 43210</span></li>
            <li><FaEnvelope className="footer-inline-icon" /><span>Dilkushabiryani@gmail.com</span></li>
            <li><FaMapMarkerAlt className="footer-inline-icon" /><span>Lucknow — Office | Store | Workshop</span></li>
          </ul>
        </div>

        <div className="footer-content-follow">
          <h2 className="footer-follow-heading">Follow Us</h2>
          <p className="footer-follow-text">Stay updated with our latest biryani & offers</p>
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
            <button type="button" onClick={() => openPopup("WhatsApp Inquiry")} aria-label="WhatsApp" className="icon-whatsapp">
              <FaWhatsapp />
            </button>
          </div>

          <div className="payment">
            <span className="payment-label">Payment By</span>
            <a href="" target="_self" rel="self" aria-label="Razorpay" className="icon-facebook">
              <img src={Razorpay} alt="Razorpay" width="420" height="89" loading="lazy" />
            </a>
          </div>

          <div className="apps">
            <span className="payment-label">Get Our App</span>
            <a
              href="#"
              aria-label="Google Play (coming soon)"
              aria-haspopup="dialog"
              className="icon-facebook"
              onClick={openAppModal}
            >
              <img src={PlayStore} alt="Get it on Google Play" width="240" height="240" loading="lazy" />
            </a>
            <a
              href="#"
              aria-label="App Store (coming soon)"
              aria-haspopup="dialog"
              className="icon-instagram"
              onClick={openAppModal}
            >
              <img src={AppStore} alt="Download on the App Store" width="360" height="139" loading="lazy" />
            </a>
          </div>
        </div>
      </StaggerChildren>

      <div className="footer-bottom-bar">
        <p className="footer-copyright">
          Copyright 2026 © Dilkusha Biryani. All Rights Reserved.
        </p>

        <p className="footer-copyright">Powered by DesignerBirds.</p><p className="footer-copyright">For Support Contact 97602 48776</p>

        <p className="footer-credit">
          Design and Developed by{" "}
          <a href="https://designerbirds.com/" target="_blank" rel="noreferrer">
            Designerbirds Team
          </a>
        </p>
      </div>

      {showPopup && <PopupForm type={popupType} onClose={() => setShowPopup(false)} />}
      {appModal && <AppComingSoonModal onClose={closeAppModal} />}
      <Suspense fallback={null}>
        {riderPopup === "form" && <RiderModal onClose={() => setRiderPopup(null)} />}
        {riderPopup === "qr" && <RiderQrModal onClose={() => setRiderPopup(null)} />}
      </Suspense>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────
   "Coming soon" popup for the Play Store / App Store icons (same popup for both)
   Tip: change --cs-accent / --cs-accent-soft below to match your brand colour.
   ──────────────────────────────────────────────────────────────────────── */
const APP_MODAL_CSS = `
  .cs-overlay {
    position: fixed; inset: 0; z-index: 2000;
    display: flex; align-items: center; justify-content: center;
    padding: 16px; background: rgba(17, 24, 39, 0.62);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    animation: csFade .2s ease both;
  }
  .cs-modal {
    --cs-accent: #e8590c;
    --cs-accent-soft: #fff1e8;
    position: relative; width: 100%; max-width: 380px;
    background: #fff; color: #1f2937; text-align: center;
    border-radius: 20px; padding: 38px 28px 26px;
    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.45);
    animation: csPop .26s cubic-bezier(.2, .8, .2, 1) both;
    font-family: inherit;
  }
  .cs-close {
    position: absolute; top: 12px; right: 12px; width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    border: none; border-radius: 50%; background: #f3f4f6; color: #6b7280; cursor: pointer;
    transition: background .15s ease, color .15s ease;
  }
  .cs-close:hover { background: #e5e7eb; color: #111827; }
  .cs-icon {
    width: 68px; height: 68px; margin: 0 auto 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; color: var(--cs-accent); background: var(--cs-accent-soft);
  }
  .cs-pill {
    display: inline-block; margin-bottom: 12px; padding: 4px 12px; border-radius: 999px;
    font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    color: var(--cs-accent); background: var(--cs-accent-soft);
  }
  .cs-title { margin: 0 0 8px; font-size: 22px; line-height: 1.25; font-weight: 700; color: #111827; }
  .cs-text { margin: 0 0 22px; font-size: 15px; line-height: 1.6; color: #6b7280; }
  .cs-btn {
    width: 100%; padding: 12px 16px; border: none; border-radius: 12px; cursor: pointer;
    font: inherit; font-size: 15px; font-weight: 600; color: #fff; background: var(--cs-accent);
    transition: filter .15s ease, transform .15s ease;
  }
  .cs-btn:hover { filter: brightness(.94); }
  .cs-btn:active { transform: scale(.99); }
  .cs-btn:focus-visible, .cs-close:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px; }
  @keyframes csFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes csPop { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
  @media (max-width: 480px) { .cs-modal { padding: 34px 20px 22px; border-radius: 18px; } .cs-title { font-size: 20px; } }
  @media (prefers-reduced-motion: reduce) { .cs-overlay, .cs-modal { animation: none; } }
`;

const AppComingSoonModal = ({ onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Keep keyboard focus inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="cs-overlay" onClick={onClose}>
      <style>{APP_MODAL_CSS}</style>
      <div
        className="cs-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-title"
        aria-describedby="cs-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="cs-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="cs-icon" aria-hidden="true">
          <FaMobileAlt />
        </div>

        <span className="cs-pill">Coming soon</span>
        <h2 className="cs-title" id="cs-title">Our app is coming soon</h2>
        <p className="cs-text" id="cs-desc">
          We are launching on Google Play and the App Store very soon. Till then, you can order on our website.
        </p>

        <button type="button" className="cs-btn" ref={closeRef} onClick={onClose}>
          Got it
        </button>
      </div>
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
    const whatsappNumber = "";
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