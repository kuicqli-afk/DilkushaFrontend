import "./Pages.css";
import kalyanpur from "../../assets/gomtinagar1jpg.avif";

import Footer from "../Footer/Footer";
import { useEffect } from "react";

// import "./LatestListing.css";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaStore, FaStar } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import GomtinagarData from "./GomtinagarData";


/* ⭐ rating stars renderer (FIXED: 5 stars) */
const renderStars = (rating = 0) => {
  const r = Number.isFinite(rating) ? rating : 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;

  return Array.from({ length: 1 }).map((_, i) => {
    let cls = "star empty";
    if (i < full) cls = "star full";
    else if (i === full && half) cls = "star half";
    return <FaStar key={i} className={cls} />;
  });
};



function LatestCard({ item, onAdd }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  const isExternal = String(item.cardLink || "").startsWith("http");
  const isHashLink = item.cardLink === "#" || !item.cardLink;
  const isInternal = !isExternal && !isHashLink;

  const cardBody = (
    <>
      <div
        className="latest-image"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div
          className={`status-badge-latest ${item.status === "Open" ? "open" : "closed"
            }`}
        >
          {String(item.status || "").toUpperCase()}
        </div>

        <div className="latest-tag">FEATURED</div>

        <div className="latest-logo">
          <img src={item.logo} alt="logo" loading="lazy" />
        </div>

        {/* ✅ ADD button (same pattern) */}
        {item.showAdd && (
          <button
            className="add-badges"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd(item);
            }}
          >
            ADD
          </button>
        )}
      </div>

      <div className="latest-info">
        <div className="title-row">
          <h3>{item.title}</h3>

          <div className="rating">
            <div className="rating-num">{(item.rating ?? 0).toFixed(1)}</div>
            <span className="stars">{renderStars(item.rating)}</span>
          </div>
        </div>

        <p>{item.subtitle}</p>

        <div className="location-latest">
          <FaMapMarkerAlt id="latest-icon" /> {item.address}
        </div>

        <div className="phone-latest">
          <FaPhoneAlt id="latest-icon" /> {item.phone}
        </div>

        <a
          href={item.categoryLink}
          className="category-link-latest"
          target={item.categoryLink && item.categoryLink !== "#" ? "_blank" : "_self"}
          rel={item.categoryLink && item.categoryLink !== "#" ? "noopener noreferrer" : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          <FaStore /> {item.category}
        </a>
      </div>
    </>
  );

  // ✅ Link handling like featured (external => <a>, internal => <Link>, # => <a>)
  if (isExternal) {
    return (
      <a
        href={item.cardLink}
        className={`latest-card ${inView ? "visible" : ""}`}
        target="_blank"
        rel="noopener noreferrer"
        ref={ref}
      >
        {cardBody}
      </a>
    );
  }

  if (isInternal) {
    return (
      <Link
        to={item.cardLink}
        className={`latest-card ${inView ? "visible" : ""}`}
        ref={ref}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <a
      href={item.cardLink || "#"}
      className={`latest-card ${inView ? "visible" : ""}`}
      rel="noopener noreferrer"
      ref={ref}
    >
      {cardBody}
    </a>
  );
}
export default function Kalyanpur() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const handleAdd = (item) => {
    // ✅ yaha apna add-to-cart logic
    console.log("ADD clicked:", item.id, item.subtitle);
  };
  return (
    <div className="area-page">
      <div className="area-banner">
        <img src={kalyanpur} alt="Kalyanpur Banner" />

        <div className="area-banner-overlay">
          <div className="area-banner-content">
            <h2>Restaurants in</h2>

            <p>
              Explore popular restaurants in your area and enjoy exciting
              discounts and special offers.
            </p>

            <div className="area-city">GOMTI NAGAR</div>
          </div>
        </div>
      </div>

      <div className="latest-container">
        <div className="latest-header">
          <h4>HANDPICKED PLACES</h4>
          <h2>Latest Restaurant In Gomti Nagar</h2>
          <p>
            Explore popular restaurants in your area and enjoy exciting discounts
            and special offers.
          </p>
        </div>

        <div className="latest-grid">
          {GomtinagarData.map((item) => (
            <LatestCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
