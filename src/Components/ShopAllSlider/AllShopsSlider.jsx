import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa";
// import offer from "../../assets/offer.png";
import fssai from "../../assets/fssai.png";

function AllShopsSlider() {
  const [restaurant, setRestaurant] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);
// const [restaurant, setRestaurant] = useState(null);

useEffect(() => {
  const fetchRestaurant = async () => {
    try {
      // Use location.state first if exists, otherwise fetch first restaurant
      const res = await axios.get("http://localhost:4000/api/restaurant/get-restaurants");
      const clickedRestaurant = location.state?.restaurant || res.data.data[0];
      setRestaurant(clickedRestaurant);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRestaurant();
}, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setIndex((prev) => prev + 1);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= (restaurant?.slides?.length ?? 0)) {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIndex(0);
      }
      isTransitioning.current = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      track.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, restaurant]);

  // Conditional render **only for content**, hooks are already called above
  if (!restaurant) {
    return <h1>Loading restaurant...</h1>;
  }

  const slides = restaurant.slides ?? [];
  const loopSlides = slides.length ? [...slides, ...slides] : [];
  const categories = restaurant.categories ?? [];

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderStars = (rating = 0) => (
    <FaStar className={rating >= 1 ? "star full" : "star empty"} />
  );

  return (
    <div className="restaurant-detail-page">
      {/* Navbar */}
      <div className="navbar1">
        <div className="logo1">
          <img src={restaurant.logo} alt="Restaurant Logo" />
        </div>
        <div className="categories1">
          {categories.map((category, i) => (
            <div
              key={i}
              className={`category-item1 ${activeCategory === category.id ? "active" : ""
                }`}
              onClick={() => {
                setActiveCategory(category.id);
                handleScroll(category.id);
              }}
            >
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {/* Slider */}
      <section className="image-section1">
        <div className="slider-container">
          <div className="slider-track" ref={trackRef}>
            {loopSlides.map((img, i) => (
              <div className="slide" key={i}>
                <img src={img} className="bg-img" alt="slide" />
                <img src={offer} className="offer-img" alt="offer" />
              </div>
            ))}
          </div>
          <div className="slider-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`dot ${index % slides.length === i ? "active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <div className="restaurant-about">
        <div className="restaurant-info">
          <h1>{restaurant.title}</h1>
          <small>{restaurant.subtitle}</small>
          <p><strong>Address:</strong> {restaurant.address}</p>
          <p><strong>Phone:</strong> {restaurant.phone}</p>
          <div className="timing-row">
            <p style={{ fontWeight: 1000 }}>Timing: </p>
            <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            <span>{currentTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            <span className={`status-badgess ${restaurant.status === "Open" ? "open" : "closed"}`}>
              {restaurant.status?.toUpperCase()}
            </span>
          </div>
          <p><strong>GST: </strong>{restaurant.gst}</p>
          <p><strong>Fssai: <img style={{ width: "35px" }} src={fssai} alt="fssai" /> </strong>{restaurant.fssai}</p>
        </div>
      </div>
    </div>
  );
}

export default AllShopsSlider;