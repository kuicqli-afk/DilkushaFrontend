import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useCart } from "../../Context/CartContext";
import Featured from "../FeaturedListings/FeaturedListingsData";
import { AllShopData } from "../ShopsData";

import "../../Components/ShopsDetailPage/RestaurantDetailPage.css";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🔥 Get Restaurant Info
  const restaurant = Featured.find((r) => r.id === Number(id));

  // 🔥 Get Restaurant Items
  const items = AllShopData[id] || [];

  const { cartItems, addToCart, updateQty, getCartKey } = useCart();

  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  if (!restaurant) {
    return <h1>Restaurant Not Found</h1>;
  }

  // ⭐ Auto Slider
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
    if (!track || !restaurant.slides) return;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= restaurant.slides.length) {
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

  const getQty = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    return found ? found.quantity : 0;
  };

  const increase = (item) => addToCart(item, 1);
  const decrease = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    if (found) updateQty(key, found.quantity - 1);
  };

  return (
    <div className="restaurant-detail-page">

      {/* 🔥 Dynamic Slider */}
      <div className="slider">
        <div className="slider-track" ref={trackRef}>
          {restaurant.slides?.map((slide, i) => (
            <img key={i} src={slide} alt="slide" />
          ))}
        </div>
      </div>

      {/* 🔥 Restaurant Info */}
      <div className="restaurant-info">
        <h1>{restaurant.title}</h1>
        <p>{restaurant.desc}</p>
        <div className="rating">
          <FaStar /> {restaurant.rating} ({restaurant.totalRatings})
        </div>
      </div>

      {/* 🔥 Dynamic Menu */}
      <div className="menu-section">
        {items.length === 0 ? (
          <h2>No Items Available</h2>
        ) : (
          items.map((item) => (
            <div key={item.id} className="food-card">
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>₹ {item.price}</p>

              <div className="cart-controls">
                <button onClick={() => decrease(item)}>-</button>
                <span>{getQty(item)}</span>
                <button onClick={() => increase(item)}>+</button>
              </div>

              <button
                onClick={() =>
                  navigate("/order", { state: { item } })
                }
              >
                Place Order
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default RestaurantDetail;