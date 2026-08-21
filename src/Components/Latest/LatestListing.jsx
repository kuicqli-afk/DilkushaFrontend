import React from "react";
import "./LatestListing.css";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaStore, FaStar } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

import restaurantImg1 from "../../assets/restaurant1.jpg";
import restaurantImg2 from "../../assets/restaurant2.jpg";
import restaurantImg3 from "../../assets/restaurant3.jpg";
import restaurantImg4 from "../../assets/restaurant4.jpg";
import restaurantImg5 from "../../assets/restaurant5.jpg";
import restaurantImg6 from "../../assets/restaurant6.jpg";
import restaurantImg7 from "../../assets/restaurant7.jpg";
import restaurantImg8 from "../../assets/restaurant8.jpg";
import restaurantImg9 from "../../assets/restaurant9.jpg";
import restaurantImg10 from "../../assets/restaurant10.jpg";

import restaurantLogo1 from "../../assets/restaurant1.jpg";
import restaurantLogo2 from "../../assets/restaurant2.jpg";
import restaurantLogo3 from "../../assets/restaurant3.jpg";
import restaurantLogo4 from "../../assets/restaurant4.jpg";
import restaurantLogo5 from "../../assets/restaurant5.jpg";
import restaurantLogo6 from "../../assets/restaurant6.jpg";
import restaurantLogo7 from "../../assets/restaurant7.jpg";
import restaurantLogo8 from "../../assets/restaurant8.jpg";
import restaurantLogo9 from "../../assets/restaurant9.jpg";
import restaurantLogo10 from "../../assets/restaurant10.jpg";

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

export const listings = [
  {
    id: 1,
    title: "Restaurant",
    subtitle: "Family Dining",
    address: "Khuramnagar, Lucknow",
    phone: "+91 94150 67244",
    category: "Restaurants",
    image: restaurantImg1,
    logo: restaurantLogo1,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.6,
    showAdd: false,
  },
  {
    id: 2,
    title: "Restaurant",
    subtitle: "North Indian & Chinese",
    address: "Khuramnagar, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg2,
    logo: restaurantLogo2,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.2,
    showAdd: true,
  },
  {
    id: 3,
    title: "Restaurant",
    subtitle: "Multi Cuisine Restaurant",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg3,
    logo: restaurantLogo3,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.8,
    showAdd: false,
  },
  {
    id: 4,
    title: "Restaurant",
    subtitle: "Cafe & Desserts",
    address: "Khuramnagar, Lucknow",
    phone: "+91 9336628616",
    category: "Cafes",
    image: restaurantImg4,
    logo: restaurantLogo4,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.1,
    showAdd: false,
  },
  {
    id: 5,
    title: "Restaurant",
    subtitle: "Fast Food & Snacks",
    address: "Kalyanpur, Lucknow",
    phone: "+91 9335420638",
    category: "Fast Food",
    image: restaurantImg5,
    logo: restaurantLogo5,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 3.9,
    showAdd: true,
  },
  {
    id: 6,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg6,
    logo: restaurantLogo6,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 4.0,
    showAdd: false,
  },
  {
    id: 7,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg7,
    logo: restaurantLogo7,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.5,
    showAdd: true,
  },
  {
    id: 8,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg8,
    logo: restaurantLogo8,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 3.7,
    showAdd: false,
  },
  {
    id: 9,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg9,
    logo: restaurantLogo9,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: false,
  },
  {
    id: 10,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg10,
    logo: restaurantLogo10,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: true,
  },
  {
    id: 11,
    title: "Restaurant",
    subtitle: "Family Dining",
    address: "Khuramnagar, Lucknow",
    phone: "+91 94150 67244",
    category: "Restaurants",
    image: restaurantImg1,
    logo: restaurantLogo1,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.6,
    showAdd: false,
  },
  {
    id: 12,
    title: "Restaurant",
    subtitle: "North Indian & Chinese",
    address: "Khuramnagar, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg2,
    logo: restaurantLogo2,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.2,
    showAdd: true,
  },
  {
    id: 13,
    title: "Restaurant",
    subtitle: "Multi Cuisine Restaurant",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg3,
    logo: restaurantLogo3,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.8,
    showAdd: false,
  },
  {
    id: 14,
    title: "Restaurant",
    subtitle: "Cafe & Desserts",
    address: "Khuramnagar, Lucknow",
    phone: "+91 9336628616",
    category: "Cafes",
    image: restaurantImg4,
    logo: restaurantLogo4,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.1,
    showAdd: false,
  },
  {
    id: 15,
    title: "Restaurant",
    subtitle: "Fast Food & Snacks",
    address: "Kalyanpur, Lucknow",
    phone: "+91 9335420638",
    category: "Fast Food",
    image: restaurantImg5,
    logo: restaurantLogo5,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 3.9,
    showAdd: true,
  },
  {
    id: 16,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg6,
    logo: restaurantLogo6,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 4.0,
    showAdd: false,
  },
  {
    id: 17,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg7,
    logo: restaurantLogo7,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.5,
    showAdd: true,
  },
  {
    id: 18,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg8,
    logo: restaurantLogo8,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 3.7,
    showAdd: false,
  },
  {
    id: 19,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg9,
    logo: restaurantLogo9,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: false,
  },
  {
    id: 20,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg10,
    logo: restaurantLogo10,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: true,
  },
    {
    id: 21,
    title: "Restaurant",
    subtitle: "Family Dining",
    address: "Khuramnagar, Lucknow",
    phone: "+91 94150 67244",
    category: "Restaurants",
    image: restaurantImg1,
    logo: restaurantLogo1,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.6,
    showAdd: false,
  },
  {
    id: 22,
    title: "Restaurant",
    subtitle: "North Indian & Chinese",
    address: "Khuramnagar, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg2,
    logo: restaurantLogo2,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.2,
    showAdd: true,
  },
  {
    id: 23,
    title: "Restaurant",
    subtitle: "Multi Cuisine Restaurant",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg3,
    logo: restaurantLogo3,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.8,
    showAdd: false,
  },
  {
    id: 24,
    title: "Restaurant",
    subtitle: "Cafe & Desserts",
    address: "Khuramnagar, Lucknow",
    phone: "+91 9336628616",
    category: "Cafes",
    image: restaurantImg4,
    logo: restaurantLogo4,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.1,
    showAdd: false,
  },
  {
    id: 25,
    title: "Restaurant",
    subtitle: "Fast Food & Snacks",
    address: "Kalyanpur, Lucknow",
    phone: "+91 9335420638",
    category: "Fast Food",
    image: restaurantImg5,
    logo: restaurantLogo5,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 3.9,
    showAdd: true,
  },
  {
    id: 26,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg6,
    logo: restaurantLogo6,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 4.0,
    showAdd: false,
  },
  {
    id: 27,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg7,
    logo: restaurantLogo7,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.5,
    showAdd: true,
  },
  {
    id: 28,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg8,
    logo: restaurantLogo8,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 3.7,
    showAdd: false,
  },
  {
    id: 29,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg9,
    logo: restaurantLogo9,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: false,
  },
  {
    id: 30,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg10,
    logo: restaurantLogo10,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: true,
  },
    {
    id: 31,
    title: "Restaurant",
    subtitle: "Family Dining",
    address: "Khuramnagar, Lucknow",
    phone: "+91 94150 67244",
    category: "Restaurants",
    image: restaurantImg1,
    logo: restaurantLogo1,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.6,
    showAdd: false,
  },
  {
    id: 32,
    title: "Restaurant",
    subtitle: "North Indian & Chinese",
    address: "Khuramnagar, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg2,
    logo: restaurantLogo2,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.2,
    showAdd: true,
  },
  {
    id: 33,
    title: "Restaurant",
    subtitle: "Multi Cuisine Restaurant",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg3,
    logo: restaurantLogo3,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.8,
    showAdd: false,
  },
  {
    id: 34,
    title: "Restaurant",
    subtitle: "Cafe & Desserts",
    address: "Khuramnagar, Lucknow",
    phone: "+91 9336628616",
    category: "Cafes",
    image: restaurantImg4,
    logo: restaurantLogo4,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.1,
    showAdd: false,
  },
  {
    id: 35,
    title: "Restaurant",
    subtitle: "Fast Food & Snacks",
    address: "Kalyanpur, Lucknow",
    phone: "+91 9335420638",
    category: "Fast Food",
    image: restaurantImg5,
    logo: restaurantLogo5,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 3.9,
    showAdd: true,
  },
  {
    id: 36,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg6,
    logo: restaurantLogo6,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 4.0,
    showAdd: false,
  },
  {
    id: 37,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg7,
    logo: restaurantLogo7,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.5,
    showAdd: true,
  },
  {
    id: 38,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg8,
    logo: restaurantLogo8,
    categoryLink: "#",
    cardLink: "#",
    status: "Closed",
    rating: 3.7,
    showAdd: false,
  },
  {
    id: 39,
    title: "Restaurant",
    subtitle: "Biryani & Kebabs",
    address: "Indiranagar, Lucknow",
    phone: "+91 9838289222",
    category: "Restaurants",
    image: restaurantImg9,
    logo: restaurantLogo9,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: false,
  },
  {
    id: 40,
    title: "Restaurant",
    subtitle: "Pizza | Pasta | Beverages",
    address: "Daliganj, Lucknow",
    phone: "+91 83181 01919",
    category: "Restaurants",
    image: restaurantImg10,
    logo: restaurantLogo10,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    showAdd: true,
  },

];

/* ✅ Card component (optional animation + add handler safe) */
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
          className={`status-badge-latest ${
            item.status === "Open" ? "open" : "closed"
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

const LatestListing = () => {
  const handleAdd = (item) => {
    // ✅ yaha apna add-to-cart logic
    console.log("ADD clicked:", item.id, item.subtitle);
  };
  return (
    <div className="latest-container">
      <div className="latest-header">
        <h4>HANDPICKED PLACES</h4>
        <h2>Latest Listings</h2>
        <p>
          Explore popular restaurants in your area and enjoy exciting discounts
          and special offers.
        </p>
      </div>

      <div className="latest-grid">
        {listings.map((item) => (
          <LatestCard key={item.id} item={item} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  );
};

export default LatestListing;
