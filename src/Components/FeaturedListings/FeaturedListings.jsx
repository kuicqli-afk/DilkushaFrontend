import React from "react";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaStore, FaStar } from "react-icons/fa";

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";

import "./FeaturedListings.css";

// ✅ Assets
import tundayImg from "../../assets/restaurant1.jpg";
import tundayLogo from "../../assets/restaurant1.jpg";

import idreesImg from "../../assets/restaurant3.jpg";
import idreesLogo from "../../assets/restaurant3.jpg";

import dastarkhwanImg from "../../assets/restaurant4.jpg";
import dastarkhwanLogo from "../../assets/restaurant4.jpg";

import royalCafeImg from "../../assets/restaurant5.jpg";
import royalCafeLogo from "../../assets/restaurant5.jpg";

import marksmenImg from "../../assets/restaurant3.jpg";
import marksmenLogo from "../../assets/restaurant3.jpg";

import rahimImg from "../../assets/restaurant4.jpg";
import rahimLogo from "../../assets/restaurant4.jpg";

import mubeensImg from "../../assets/restaurant5.jpg";
import mubeensLogo from "../../assets/restaurant5.jpg";

import kalikaImg from "../../assets/restaurant3.jpg";
import kalikaLogo from "../../assets/restaurant3.jpg";

/* ⭐ rating helper (0-5) */
const renderStars = (rating = 0) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;


  return Array.from({ length: 1 }).map((_, i) => {
    let cls = "star empty";
    if (i < full) cls = "star full";
    else if (i === full && half) cls = "star half";

    return <FaStar key={i} className={cls} />;
  });
};
const scrollToTop = () => {
  window.scrollTo(0, 0);
};
const listings = [
  {
    id: 1,  // First ID
    title: "Restaurant",
    subtitle: "Famous Galouti Kebab",
    address: "Aminabad, Lucknow",
    phone: "+91 97930 00000",
    category: "Non-Veg Restaurant",
    image: tundayImg,
    logo: tundayLogo,
    categoryLink: "restaurant",
    cardLink: "FamousGaloutiKebab",
    status: "Close",
    rating: 4.6,
    gst: 9043898996709,
    totalRatings: 200,
    followers: 4000,
    products: 300,
    showAdd: true,
  },
  {
    id: 2,  // Second ID
    title: "Restaurant",
    subtitle: "Lucknowi Dum Biryani",
    address: "Chowk, Lucknow",
    phone: "+91 98390 00001",
    category: "Biryani Restaurant",
    image: idreesImg,
    logo: idreesLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.8,
    gst: 89908098900,
    totalRatings: 150,
    followers: 2500,
    products: 120,
    showAdd: false,
  },
  {
    id: 3,  // Third IDz
    title: "Restaurant",
    subtitle: "Mughlai & Awadhi Cuisine",
    address: "Hazratganj, Lucknow",
    phone: "+91 93350 00002",
    category: "Fine Dine Restaurant",
    image: dastarkhwanImg,
    logo: dastarkhwanLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Close",
    rating: 4.4,
    gst: 8564589798798,
    totalRatings: 180,
    followers: 3200,
    products: 200,
    showAdd: true,
  },
  {
    id: 4,  // Fourth ID
    title: "Restaurant",
    subtitle: "Basket Chaat Special",
    address: "Hazratganj, Lucknow",
    phone: "+91 94150 00003",
    category: "Veg Restaurant",
    image: royalCafeImg,
    logo: royalCafeLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.7,
    gst: 90850648085043,
    totalRatings: 220,
    followers: 3800,
    products: 180,
    showAdd: false,
  },
  {
    id: 5,  // Fifth ID
    title: "Restaurant",
    subtitle: "Classic Family Restaurant",
    address: "Hazratganj, Lucknow",
    phone: "+91 97940 00004",
    category: "Multi-Cuisine",
    image: marksmenImg,
    logo: marksmenLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Close",
    rating: 4.2,
    gst: 5468907978968345,
    totalRatings: 150,
    followers: 2100,
    products: 160,
    showAdd: true,
  },
  {
    id: 6,  // Sixth ID
    title: "Restaurant",
    subtitle: "Traditional Nihari",
    address: "Akbari Gate, Lucknow",
    phone: "+91 99360 00005",
    category: "Non-Veg Restaurant",
    image: rahimImg,
    logo: rahimLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.5,
    gst: 13748973497897,
    totalRatings: 210,
    followers: 3200,
    products: 170,
    showAdd: false,
  },
  {
    id: 7,  // Seventh ID
    title: "Restaurant",
    subtitle: "Mutton & Chicken Special",
    address: "Chowk, Lucknow",
    phone: "+91 94510 00006",
    category: "Non-Veg Restaurant",
    image: mubeensImg,
    logo: mubeensLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.1,
    gst: 13233245675632,
    totalRatings: 160,
    followers: 2900,
    products: 140,
    showAdd: true,
  },
  {
    id: 8,  // Eighth ID
    title: "Restaurant",
    subtitle: "Pure Veg & Snacks",
    address: "Alambagh, Lucknow",
    phone: "+91 98890 00007",
    category: "Veg Restaurant",
    image: kalikaImg,
    logo: kalikaLogo,
    categoryLink: "#",
    cardLink: "#",
    status: "Open",
    rating: 4.3,
    gst: 971212121321312,
    totalRatings: 190,
    followers: 3300,
    products: 180,
    showAdd: false,
  },
];


export default function FeaturedListings() {
  // const handleAdd = (e, item) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // ✅ yaha apna add-to-cart logic laga do
  //   console.log("ADD clicked:", item.title, item.rating);
  // };

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

      {/* ✅ Swiper Slider */}
      <Swiper
        modules={[FreeMode, Autoplay]}
        freeMode={true}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        slidesPerView={1.2}
        spaceBetween={5}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1200: { slidesPerView: 5 },
        }}
        className="featured-swiper"
      >
        {listings.map((item, idx) => {
          const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
          const isExternal = String(item.cardLink || "").startsWith("http");

          const cardContent = (
            <>
              <div
                className="featured-image"
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div
                  className={`status-badge ${item.status === "Open" ? "open" : "closed"}`}
                >
                  {item.status ? item.status.toUpperCase() : ""}
                </div>

                <div className="featured-tag">FEATURED</div>


                {item.showAdd && (
                  <button className="featured-add-btn" onClick={(e) => handleAdd(e, item)}>
                    Ads
                  </button>
                )}

                <div className="featured-logo">
                  <img src={item.logo} alt="logo" />
                </div>
              </div>

              <div className="featured-info">
                {/* ✅ Title + Rating */}
                <div className="title-row">
                  <h3>{item.title}</h3>

                  <div className="rating">
                    <div className="rating-num">{item.rating?.toFixed(1)}</div>
                    <span className="stars">{renderStars(item.rating)}</span>

                  </div>
                </div>

                <p>{item.subtitle}</p>

                <div className="location">
                  <FaMapMarkerAlt /> {item.address}
                </div>

                <div className="phone">
                  <FaPhoneAlt /> {item.phone}
                </div>

                <a
                  href={item.categoryLink}
                  className="category-link"
                  target="_self"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaStore /> {item.category}
                </a>
              </div>
            </>
          );

          return (
            <SwiperSlide key={idx}>
              {isExternal ? (
                <a
                  href={item.cardLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`featured-card ${inView ? "visible" : ""}`}
                  ref={ref}
                  onClick={scrollToTop} // Scroll to top when card is clicked
                >
                  {cardContent}
                </a>
              ) : (
                <Link
                  to="/restaurant-detail"
                  state={{ restaurant: item }}
                  className={`featured-card ${inView ? "visible" : ""}`}
                  ref={ref}
                  onClick={scrollToTop}
                >
                  {cardContent}
                </Link>

              )}

            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
