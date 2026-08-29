import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegHeart } from "react-icons/fa";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

// Use the Cart context
import { useCart } from "../../Context/CartContext";
import { VscEye } from "react-icons/vsc";
import { LiaStopwatchSolid } from "react-icons/lia";

const API_URL = "https://shyamfoodbackend.onrender.com";

/* ✅ helper: decide source (local mp4 OR online url) */
const getVideoSource = (item) => item.video2 || item.video || "";

const isMp4 = (src) => {
  if (!src) return false;
  return String(src).toLowerCase().includes(".mp4");
};

// ✅ AB GENERIC HAI — MaidaItems.jsx jaisa pattern.
// "tag" batata hai konsa product-tag fetch karna hai (jo admin "Add Product" form
// ke checkbox se save hota hai: trending / combo / weekend-special / koi bhi naya tag).
// "title" section ka heading text hai — jo dikhana hai wahi pass karo.
// Isi ek component se saare homepage sections chalte hain, alag file nahi banani padti.
const Items = ({
  tag = "trending",
  title = "Hot & Trending Food Offers",
  sectionId,
  filter,
  sortBy,
  price,
  cuisine,
}) => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const { cartItems, addToCart, updateQty, getCartKey } = useCart();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});

  // ✅ FETCH — backend se isi "tag" wale products
  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    axios
      .get(`${API_URL}/api/products?tag=${encodeURIComponent(tag)}`)
      .then((res) => {
        const products = res.data?.products || res.data?.data || [];
        setList(Array.isArray(products) ? products : []);
      })
      .catch((err) => {
        console.error(`Fetch "${tag}" Items Error:`, err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  const filteredList = useMemo(() => {
    let result = [...list];

    // Veg / Non-Veg filter
    if (filter === "veg") {
      result = result.filter((item) => item.type === "veg");
    }

    if (filter === "nonveg") {
      result = result.filter((item) => item.type === "non-veg" || item.type === "nonveg");
    }

    // Price filter
    if (price) {
      const [min, max] = price.split("-").map(Number);
      result = result.filter((item) => (max ? item.price >= min && item.price <= max : item.price >= min));
    }

    // Cuisine filter
    if (cuisine) {
      result = result.filter((item) => item.cuisine === cuisine);
    }

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sortBy === "priceLow") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "priceHigh") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [list, filter, price, cuisine, sortBy]);

  /* ================= QTY ================= */
  const getQty = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    return found ? found.quantity : "ADD";
  };

  const increase = (item) => {
    addToCart(item, 1);
  };

  const decrease = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    if (!found) return;
    updateQty(key, found.quantity - 1);
  };

  const placeOrder = (item) =>
    navigate("/order", {
      state: {
        item,
        quantity: getQty(item),
        category: tag,
      },
    });

  // ✅ Backend se data load hone ya khaali hone par section silently hide
  if (loading) return null;
  if (!filteredList.length) return null;

  return (
    <div id={sectionId || tag} className="food-container">
      <div className="food-text">
        <h1>{title}</h1>
        <p className="view-all" onClick={() => navigate(`/section/${tag}`)}>
          View all
        </p>
      </div>

      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        loop={filteredList.length > 5}
        speed={700}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          300: { slidesPerView: 1, spaceBetween: 20 },
          400: { slidesPerView: 1.3, spaceBetween: 20 },
          500: { slidesPerView: 1.5, spaceBetween: 20 },
          700: { slidesPerView: 2, spaceBetween: 18 },
          800: { slidesPerView: 2.5, spaceBetween: 18 },
          1000: { slidesPerView: 3, spaceBetween: 18 },
          900: { slidesPerView: 2.5, spaceBetween: 23 },
          1224: { slidesPerView: 3.8, spaceBetween: 23 },
          1300: { slidesPerView: 4, spaceBetween: 16 },
          1500: { slidesPerView: 4, spaceBetween: 20 },
          1600: { slidesPerView: 5, spaceBetween: 16 },
        }}
        className="food-card-row"
      >
        {filteredList.map((item) => {
          const videoSrc = getVideoSource(item);
          const hasVideo = Boolean(videoSrc);

          return (
            <SwiperSlide key={item._id}>
              <div className="food-card">
                {/* ✅ ADD badge – only for video cards */}
                {hasVideo && <div className="add-badge">Ads</div>}

                <div className="food-image-wrapper">
                  {/* ✅ VIDEO/IMAGE SAME PLACE */}
                  {hasVideo ? (
                    isMp4(videoSrc) ? (
                      // ▶️ MP4 (local or online mp4)
                      <video
                        className="food-images"
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={item.image}
                      />
                    ) : (
                      // 🌐 YouTube / Instagram embed
                      <iframe
                        className="food-images"
                        src={videoSrc}
                        title={item.title}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    )
                  ) : (
                    // 🖼 Image fallback
                    <img src={item.image} alt={item.title} className="food-images" />
                  )}

                  <div className="view-eye">
                    <VscEye style={{ fontSize: "22px", color: "white", marginBottom: "-2px", cursor: "pointer" }} />
                    {item.view || 0}
                  </div>
                  <img className="top-icon" src={item.type === "veg" ? GreenArrow : RedArrow} alt="food-type" />
                </div>

                <div className="food-info">
                  <div className="food-status-left">
                    <img src={item.isOpen === false ? Close : Open} alt="" />
                    <p>{item.status}</p>

                    <div className="food-status-right-icon">
                      <LiaStopwatchSolid
                        size={24}
                        color="#ff5722"
                        title="Select Slot"
                        onClick={() => setOpenCardId(openCardId === item._id ? null : item._id)}
                        style={{ marginTop: "-1px", cursor: "pointer" }}
                      />

                      <FaRegHeart size={20} color="" title="Like" style={{ cursor: "pointer" }} />
                      <img src={SaveIcon} alt="Save" title="Book Mark" />
                      <img src={ShareIcon} alt="Share" title="Share" />
                    </div>
                  </div>

                  <h2>
                    {item.title} <span>({item.portion})</span>
                  </h2>

                  <p className="food-desc">{(item.desc || "").slice(0, 70)}...</p>

                  <div className="food-rating">
                    <img src={StarIcon} alt="" />
                    <h3>
                      {item.rating || 0} <span>({item.reviews || 0})</span>
                    </h3>
                    <p>{item.orders || 0} orders last week</p>
                  </div>

                  <div className="food-price-row">
                    <span className="food-price">
                      <small className="Rs">₹</small> {item.price}
                    </span>
                    {item.offer > 0 && (
                      <span className="offer">
                        <small className="offer">₹</small>
                        {item.offer}
                      </span>
                    )}
                    {item.off > 0 && <span className="food-off">{item.off}% OFF</span>}
                  </div>

                  <div className="food-actions">
                    <button className="order-btn" onClick={() => placeOrder(item)}>
                      Place order
                    </button>

                    <div className="add-btn">
                      <button onClick={() => decrease(item)}>-</button>
                      <span>{getQty(item)}</span>
                      <button onClick={() => increase(item)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="food-dots"></div>
    </div>
  );
};

export default Items;