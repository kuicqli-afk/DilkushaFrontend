import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegHeart, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./Food.css";

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

const API_URL = "https://backend.shyamnamkeenandbakers.online";

/* ✅ helper: decide source (local mp4 OR online url) */
const getVideoSource = (item) => item.video2 || item.video || "";

const isMp4 = (src) => {
  if (!src) return false;
  return String(src).toLowerCase().includes(".mp4");
};

// Fisher-Yates shuffle — randomizes product order on page load/refresh
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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
        const fetched = Array.isArray(products) ? products : [];
        setList(shuffleArray(fetched));
      })
      .catch((err) => {
        console.error(`Fetch "${tag}" Items Error:`, err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, [tag]);

  // Stock helpers — item.quantity is the source of truth
  const getStock = (item) => {
    if (item.quantity === undefined || item.quantity === null || item.quantity === "") {
      return Infinity;
    }
    return Number(item.quantity) || 0;
  };

  const isInStock = (item) => getStock(item) > 0;

  const filteredList = useMemo(() => {
    let result = [...list];

    // Filter out draft items
    result = result.filter((item) => !item.isDraft && item.status !== "Draft");

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
      result = result.filter((item) =>
        max ? item.price >= min && item.price <= max : item.price >= min
      );
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
    if (!isInStock(item)) return;

    const stock = getStock(item);
    const currentQty = getQty(item);
    const currentNum = currentQty === "ADD" ? 0 : Number(currentQty);
    if (currentNum >= stock) return;

    addToCart(item, 1);
  };

  const decrease = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    if (!found) return;
    updateQty(key, found.quantity - 1);
  };

  const placeOrder = (item) => {
    if (!isInStock(item)) return;

    navigate("/order", {
      state: {
        item,
        quantity: getQty(item),
        category: tag,
      },
    });
  };

  // Silently hide section if loading or empty
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

          const stock = getStock(item);
          const inStock = isInStock(item);
          const cartQty = getQty(item);
          const cartQtyNum = cartQty === "ADD" ? 0 : Number(cartQty);
          const atMaxStock = stock !== Infinity && cartQtyNum >= stock;

          return (
            <SwiperSlide key={item._id}>
              <div className={`food-card${!inStock ? " out-of-stock-card" : ""}`}>
                {/* ✅ ADD badge – only for video cards */}
                {hasVideo && <div className="add-badge">Ads</div>}

                <div className="food-image-wrapper">
                  {/* ✅ VIDEO/IMAGE SAME PLACE WITH BLUR ON OUT OF STOCK */}
                  {hasVideo ? (
                    isMp4(videoSrc) ? (
                      <video
                        className={`food-image${!inStock ? " blurred" : ""}`}
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={item.image}
                      />
                    ) : (
                      <iframe
                        className={`food-image${!inStock ? " blurred" : ""}`}
                        src={videoSrc}
                        title={item.title}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    )
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`food-image${!inStock ? " blurred" : ""}`}
                    />
                  )}

                  <div className="view-eye">
                    <VscEye style={{ fontSize: "22px", color: "white", marginBottom: "-2px", cursor: "pointer" }} />
                    {item.view || 0}
                  </div>
                  <img className="top-icon" src={item.type === "veg" ? GreenArrow : RedArrow} alt="food-type" />
                </div>

                <div className="food-info">
                  {/* Dynamic In Stock / Out of Stock Status */}
                  <div className="food-status-left">
                    {inStock ? (
                      <FaCheckCircle className="stock-icon in-stock-icon" title="In Stock" />
                    ) : (
                      <FaTimesCircle className="stock-icon out-stock-icon" title="Out of Stock" />
                    )}
                    <p className={inStock ? "stock-text-in" : "stock-text-out"}>
                      {inStock ? "In Stock" : "Out of Stock"}
                    </p>

                    <div className="food-status-right-icon">
                      <LiaStopwatchSolid
                        size={24}
                        color="#ff5722"
                        title="Select Slot"
                        onClick={() => setOpenCardId(openCardId === item._id ? null : item._id)}
                        style={{ marginTop: "-1px", cursor: "pointer" }}
                      />

                      <FaRegHeart size={20} title="Like" style={{ cursor: "pointer" }} />
                      <img src={SaveIcon} alt="Save" title="Book Mark" />
                      <img src={ShareIcon} alt="Share" title="Share" />
                    </div>
                  </div>

                  <h2>
                    {item.title} {item.portion && <span>({item.portion})</span>}
                    {item.weight && (
                      <span className="food-weight-inline">
                        {" "}
                        {item.weight} {item.unit || "Gram"}
                      </span>
                    )}
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
                      <small className="Rs">₹</small>
                      {item.price}
                    </span>

                    {item.offer > 0 && (
                      <span className="offer">
                        <span>M.R.P.</span>
                        <small className="offer-price">₹{item.offer}</small>
                      </span>
                    )}

                    {item.off > 0 && (
                      <span className="food-off">
                        {item.off}% OFF
                      </span>
                    )}
                  </div>

                  {/* Actions only visible when item is in stock */}
                  {inStock && (
                    <div className="food-actions">
                      <button className="order-btn" onClick={() => placeOrder(item)}>
                        Place order
                      </button>

                      <div className="add-btn">
                        <button onClick={() => decrease(item)}>-</button>
                        <span>{cartQty}</span>
                        <button
                          onClick={() => increase(item)}
                          disabled={atMaxStock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
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