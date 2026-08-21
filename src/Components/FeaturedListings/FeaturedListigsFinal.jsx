import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaStore, FaStar } from "react-icons/fa";
import "./FeaturedListings.css";
import Featured from "./FeaturedListingsData";

/* ⭐ rating helper */
const renderStars = (rating = 0) => {
  return Array.from({ length: 1 }).map((_, i) => (
    <FaStar
      key={i}
      className={i < Math.floor(rating) ? "star full" : "star"}
    />
  ));
};

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

function FeaturedListigsFinal() {
  return (
    <div className="featured-container">
      <div className="featured-header">
        <div className="featured-texts">
          <h4>HANDPICKED PLACES</h4>
          <h2>Featured Listings</h2>
          <p>
            Explore your popular restaurants and see what big discounts & offers
            are going on
          </p>
        </div>
      </div>
      <div className="featured-grid">
        {Featured.map((item, idx) => {
          const isExternal = String(item.cardLink || "").startsWith("http");

          const cardContent = (
            <>
              <div
                className="featured-image"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div
                  className={`status-badge ${item.status === "Open" ? "open" : "closed"
                    }`}
                >
                  {item.status?.toUpperCase()}
                </div>

                <div className="featured-tag">FEATURED</div>

                <div className="featured-logo">
                  <img src={item.logo} alt="logo" />
                </div>
              </div>

              <div className="featured-info">
                <div className="title-row">
                  <h3>{item.title}</h3>

                  <div className="rating">
                    <div className="rating-num">
                      {item.rating?.toFixed(1)}
                    </div>
                    <span className="stars">
                      {renderStars(item.rating)}
                    </span>
                  </div>
                </div>

                <p>{item.subtitle}</p>

                <div className="location">
                  <FaMapMarkerAlt /> {item.address}
                </div>

                <div className="phone">
                  <FaPhoneAlt /> {item.phone}
                </div>

                <div className="category-link">
                  <FaStore /> {item.category}
                </div>
              </div>
            </>
          );

          return isExternal ? (
            <a
              key={idx}
              href={item.cardLink}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-card"
              onClick={scrollToTop}
            >
              {cardContent}
            </a>
          ) : (
            <Link
              key={item.id}
              to={`/restaurant-detail/${item.id}`}
              state={{ restaurant: item }}
              className="featured-card"
              onClick={scrollToTop}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default FeaturedListigsFinal;
