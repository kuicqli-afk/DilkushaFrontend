import React, { useState, useEffect, useRef } from "react";
import "./RestaurantDetailPage.css";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import slide1 from "../../assets/bnanner (1).png";
import slide2 from "../../assets/bnanner (1).png";
import slide3 from "../../assets/bnanner (1).png";
import offer from "../../assets/offer.png";
import fssai from "../../assets/fssai.png"
// Components

// import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { VscEye } from "react-icons/vsc";
import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";


// import "./Food.css";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";

const API_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://shyamfoodbackend.onrender.com/api";

const slides = [slide1, slide2, slide3];
const loopSlides = [...slides, ...slides];

function ShopsMainPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const item = location.state?.restaurant;
    
    const [index, setIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    const trackRef = useRef(null);
    const isTransitioning = useRef(false);

    const categories = [
        { name: "Namkeen", id: "namkeen" },
        { name: "Chips", id: "chips" },
        { name: "Peanuts", id: "peanuts" },
    
        { name: "Dry Fruit", id: "dry-fruit-mix" },
    
        { name: "Cakes", id: "cakes" },
        { name: "Pastries", id: "pastries" },
        { name: "Cookies", id: "cookies" },
        { name: "Biscuits", id: "biscuits" },
        { name: "Breads", id: "breads" },
    
        { name: "Rusk", id: "rusk" },
    
        { name: "Festive Specials", id: "festive-specials" },
        { name: "Combo Packs", id: "combo-packs" },
        { name: "All Products", id: "All" },
      ];
    
    
    
    
      const handleScroll = (id) => {
        const section = document.getElementById(id);
    
        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      };
    
    
      // ⭐ Star Render
      const renderStars = (rating = 0) => {
        return (
          <FaStar className={rating >= 1 ? "star full" : "star empty"} />
        );
      };
      useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= slides.length) {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIndex(0);
      }
      isTransitioning.current = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () =>
      track.removeEventListener("transitionend", handleTransitionEnd);
  }, [index]);
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQty, getCartKey } = useCart();
  const [openCardId, setOpenCardId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});

  const items = ShyamList;

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

  const placeOrder = (item) =>
    navigate("/order#", { state: { item, category: "namkeen" } });

      // ⏰ Live Time
      useEffect(() => {
        const timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
    
        return () => clearInterval(timer);
      }, []);
    
      const formattedTime = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    
      const formattedDate = currentTime.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    
      // 🎞️ Auto Slider
      useEffect(() => {
        const timer = setInterval(() => {
          if (!isTransitioning.current) {
            isTransitioning.current = true;
            setIndex((prev) => prev + 1);
          }
        }, 3000);
    
        return () => clearInterval(timer);
      }, []);

      // Follow status sync
      useEffect(() => {
        const fetchFollowData = () => {
          if (isAuthenticated && user?._id) {
            axios
              .get(`${API_URL}/follow/status/${user._id}`)
              .then((res) => {
                if (res.data.success) {
                  setIsFollowing(res.data.following);
                  setFollowersCount(res.data.followersCount);
                }
              })
              .catch((err) => console.error("ShopsMainPage Follow Status Error:", err));
          } else {
            axios
              .get(`${API_URL}/follow/count`)
              .then((res) => {
                if (res.data.success) {
                  setFollowersCount(res.data.followersCount);
                }
              })
              .catch((err) => console.error("ShopsMainPage Follow Count Error:", err));
            setIsFollowing(false);
          }
        };

        fetchFollowData();

        const handleFollowChange = () => fetchFollowData();
        window.addEventListener("follow-status-changed", handleFollowChange);
        return () => window.removeEventListener("follow-status-changed", handleFollowChange);
      }, [isAuthenticated, user]);

      const handleFollowToggle = async () => {
        if (!isAuthenticated) {
          const currentPath = window.location.pathname + window.location.search;
          navigate(`/login?redirectTo=${encodeURIComponent(currentPath)}&intent=follow`);
          return;
        }

        if (followLoading) return;
        setFollowLoading(true);

        try {
          if (isFollowing) {
            const res = await axios.delete(`${API_URL}/follow/${user._id}`);
            if (res.data.success) {
              setIsFollowing(false);
              setFollowersCount(res.data.followersCount);
              window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: false } }));
            }
          } else {
            const res = await axios.post(`${API_URL}/follow`, { userId: user._id });
            if (res.data.success) {
              setIsFollowing(true);
              setFollowersCount(res.data.followersCount);
              window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: true } }));
            }
          }
        } catch (err) {
          console.error("ShopsMainPage Follow Toggle Error:", err);
        } finally {
          setFollowLoading(false);
        }
      };
    return (
        <div className="restaurant-detail-page">
            {/* Navbar */}
            <div className="navbar1">
                <div className="logo1">
                    <img src={item.logo} alt="Restaurant Logo" />
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

            {/* Slider Section */}
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
                                className={`dot ${index % slides.length === i ? "active" : ""
                                    }`}
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <div className="restaurant-about">
                <div className="restaurant-info">
                    <h1>{item.title}</h1>
                    <small>{item.subtitle}</small>

                    <p><strong>Address:</strong> {item.address}</p>
                    <p><strong>Phone:</strong> {item.phone}</p>

                    <div className="timing-row">

                        <p style={{ fontWeight: 1000 }}>Timing: </p>
                        <span>{formattedTime}</span>
                        <span>{formattedDate}</span>
                        <span
                            className={`status-badgess ${item.status === "Open" ? "open" : "closed"
                                }`}
                        >
                            {item.status?.toUpperCase()}
                        </span>
                    </div>


                    <p><strong>GST: </strong>{item.gst}</p>
                    <p><strong>Fssai: <img style={{ width: "35px" }} src={fssai} alt="fssai" /> </strong>{item.fssai}</p>

                    <div className="rat">
                        <div className="rating">
                            <span className="rating-num">{item.rating}</span>
                            <span className="stars">{renderStars(item.rating)}</span>
                        </div>
                        <div className="ratings">Ratings: {item.totalRatings}</div>
                        <div className="followers">Followers: {followersCount || item.followers}</div>
                        <div className="products">Products: {item.products}</div>


                        <div className="follow-post-buttons1">
                            <button
                                className={`follow-button1 ${isFollowing ? "following" : ""}`}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            <button className="post-button1">Create Post</button>
                        </div>
                    </div>
                </div>
                <p className="restaurant-description">
                    {item.title} is known for its delightful baked creations and unforgettable taste experience. We offer freshly baked breads, cakes, pastries, and savory treats prepared daily using premium-quality ingredients and time-honored recipes. Every product is crafted with care to ensure perfect texture, rich flavor, and consistent quality. From classic favorites to modern specialties, Shyam Bakery brings warmth, sweetness, and freshness to every bite — making it the perfect place for celebrations, casual cravings, and everyday indulgence.
                </p>
            </div>
        </div>
    )
}

export default ShopsMainPage
