import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { useCart } from "../../Context/CartContext";
import { VscEye } from "react-icons/vsc";
import AnimatedText from "../Motion/AnimatedText";
import { optimizeImage } from "../../utils/image";
import { PressButton, ProductCard, RevealImage, SplitWords } from "../Motion/motionKit";
import { ProductRowSkeleton } from "../Skeleton/Skeleton";

const BASE_URL = "http://localhost:5001";


const Offers = ({ filter, sortBy, price, cuisine }) => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const { cartItems, addToCart, updateQty, getCartKey } = useCart();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});

  // ✅ 1. Fetch Offers / Discounted Products from Backend
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/products/get-products`)
      .then((res) => {
        const rawProducts = res.data.products || res.data.data || res.data || [];

        // Filter items that have offers/discounts OR filter by category if needed
        const offerProducts = rawProducts.filter(
          (item) => item.offer > 0 || item.off > 0 || item.category === "Offers"
        );

        // Fallback to all products if no specific offers filter matches
        setList(offerProducts.length > 0 ? offerProducts : rawProducts);
      })
      .catch((err) => {
        console.error("Error fetching offer products:", err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ 2. Filter & Sort Logic
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
      state: { item, category: "offers" },
    });

  if (loading) return <ProductRowSkeleton />;
  if (!filteredList.length) return null; // Empty section hide

  return (
    <div id="offers" className="food-container">
      <div className="food-text">
        <AnimatedText as="h1" text="Offers" />
        <p className="view-all" onClick={() => navigate("/all-offers")}>
          View all
        </p>
      </div>

      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        loop={filteredList.length > 3}
        speed={900}
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
          900: { slidesPerView: 2.5, spaceBetween: 23 },
          1000: { slidesPerView: 3, spaceBetween: 18 },
          1224: { slidesPerView: 3.8, spaceBetween: 23 },
          1300: { slidesPerView: 4, spaceBetween: 16 },
          1500: { slidesPerView: 4, spaceBetween: 20 },
          1600: { slidesPerView: 5, spaceBetween: 16 },
        }}
        className="food-card-row"
      >
        {filteredList.map((item) => {
          const itemId = item._id || item.id; // ✅ Safe ID Fallback

          return (
            <SwiperSlide key={itemId}>
              <ProductCard className="food-card">
                {item.video && <div className="add-badge">Ads</div>}

                <div className="food-image-wrapper">
                  {openCardId === itemId && (
                    <div className="slot-popup-overlay">
                      <div className="slot-popup-content">
                        <h4>Select a Slot</h4>
                        <ul>
                          {Array.isArray(item.slots) &&
                            item.slots.map((slot) => (
                              <li
                                key={slot}
                                className={
                                  selectedSlots[itemId] === slot ? "selected" : ""
                                }
                                onClick={() =>
                                  setSelectedSlots({
                                    ...selectedSlots,
                                    [itemId]: slot,
                                  })
                                }
                              >
                                {slot}
                              </li>
                            ))}
                        </ul>
                        <button
                          onClick={() => {
                            alert(
                              `Order: ${item.title}\nSlot: ${selectedSlots[itemId]}\nPrice: ₹${item.price}`
                            );
                            setOpenCardId(null);
                          }}
                        >
                          Set Time & Place Order
                        </button>
                      </div>
                    </div>
                  )}

                  {item.video && item.video.endsWith(".mp4") ? (
                    <video
                      className="food-image"
                      src={item.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <RevealImage
                      src={optimizeImage(item.image, 720)}
                      alt={item.title}
                      className="food-image"
                    />
                  )}

                  <div className="view-eye">
                    <VscEye
                      style={{
                        fontSize: "22px",
                        color: "white",
                        marginBottom: "-2px",
                      }}
                    />
                    {item.view || 0}
                  </div>

                  <img
                    className="top-icon"
                    src={item.type === "veg" ? GreenArrow : RedArrow}
                    alt=""
                  />
                </div>

                <div className="food-info">
                  <div className="food-status-left">
                    <img src={item.isOpen ? Open : Close} alt="" />
                    <p>{item.status}</p>

                    <div className="food-status-right-icon">
                      <LiaStopwatchSolid
                        size={24}
                        color="#ff5722"
                        title="Select Slot"
                        onClick={() =>
                          setOpenCardId(openCardId === itemId ? null : itemId)
                        }
                        style={{ marginTop: "-1px", cursor: "pointer" }}
                      />

                      <FaRegHeart
                        size={20}
                        title="Like"
                        style={{ cursor: "pointer" }}
                      />
                      <img src={SaveIcon} alt="Save" title="Book Mark" />
                      <img src={ShareIcon} alt="Share" title="Share" />
                    </div>
                  </div>

                  <h2>
                    <SplitWords text={item.title} /> <span>({item.portion})</span>
                  </h2>

                  <p className="food-desc">
                    <SplitWords text={`${(item.desc || "").slice(0, 60)}...`} />
                  </p>

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
                    {item.off > 0 && (
                      <span className="food-off">{item.off}% OFF</span>
                    )}
                  </div>

                  <div className="food-actions">
                    <PressButton
                      className="order-btn"
                      onClick={() => placeOrder(item)}
                    >
                      Place order
                    </PressButton>

                    <div className="add-btn">
                      <PressButton onClick={() => decrease(item)}>-</PressButton>
                      <span>{getQty(item)}</span>
                      <PressButton onClick={() => increase(item)}>+</PressButton>
                    </div>
                  </div>
                </div>
              </ProductCard>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Offers;