import React, { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";

import { useNavigate, useParams } from "react-router-dom";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

// import namkeenList from "../../data/NamkeenData";
import { FaRegHeart, FaStopCircle } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";
// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { useCart } from "../../Context/CartContext";
import { VscEye, } from "react-icons/vsc";

function Namkeen({ categoryId, filter, sortBy, price, cuisine }) {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  // const { categoryId } = useParams();
  // const { slug } = useParams();
  const { cartItems, addToCart, updateQty, getCartKey } = useCart();

  // const list = useMemo(() => namkeenList, []);
  const [openCardId, setOpenCardId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products`)
      .then((res) => {
        let data = res.data.products;
        console.log("MaidaItems Data:", res.data);
        console.log("Selected Category:", categoryId);
        // ✅ SAME FILTER LOGIC
        if (categoryId) {
          data = data.filter(
            (item) =>
              item.category?.toString().trim().toLowerCase() ===
              categoryId?.toString().trim().toLowerCase()
          );
        }

        setItems(data); // ✅ correct state
      })
      .catch((err) => console.log(err));
  }, [categoryId]);

  const filteredList = useMemo(() => {
    let result = [...items];

    // Veg / Non-Veg filter
    if (filter === "veg") {
      result = result.filter(item => item.type === "veg");
    }

    if (filter === "nonveg") {
      result = result.filter(item => item.type === "nonveg");
    }

    // Price filter
    if (price) {
      const [min, max] = price.split("-").map(Number);
      result = result.filter(item =>
        max
          ? item.price >= min && item.price <= max
          : item.price >= min
      );
    }

    // Cuisine filter
    if (cuisine) {
      result = result.filter(item => item.cuisine === cuisine);
    }

    // Sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "priceLow") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "priceHigh") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [items, filter, price, cuisine, sortBy]);


  const getQty = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    return found ? found.quantity : ("ADD");
  };

  const increase = (item) => {
    addToCart(item, 1); // ✅ always +1
  };

  const decrease = (item) => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    if (!found) return;
    updateQty(key, found.quantity - 1); // 0 => remove
  };

  const placeOrder = (item) =>
    navigate("/order#", {
      state: { item, category: "bhujiya" },
    });

  return (
    <div id="bhujiya" className="food-container">
      <div className="food-text">
        <h1>Bhujiya</h1>
        {/* <h1>{items[0]?.category?.id}</h1> */}
        <p className="view-all" onClick={() => navigate("/all-bhujiya")}>View all</p>
      </div>

      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        loop={filteredList.length > 3} // <--- Only loop if enough slides
        speed={700}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}

        breakpoints={{

          300: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          400: {
            slidesPerView: 1.3,
            spaceBetween: 20,
          },
          500: {
            slidesPerView: 1.5,
            spaceBetween: 20,
          },
          700: {
            slidesPerView: 2,
            spaceBetween: 18,
          },
          800: {
            slidesPerView: 2.5,
            spaceBetween: 18,
          },
          //    900: {
          //   slidesPerView: 3,
          //   spaceBetween: 20,
          // },
          1000: {
            slidesPerView: 3,
            spaceBetween: 18,
          },

          900: {
            slidesPerView: 2.5,
            spaceBetween: 23,
          },
          1224: {
            slidesPerView: 3.8,
            spaceBetween: 23,
          },
          1300: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1500: {
            slidesPerView: 4,
            spaceBetween: 20,
          },

          1600: {
            slidesPerView: 5,
            spaceBetween: 16,
          }
        }}

        className="food-card-row"
      >

        {filteredList.map((item) => (
          <SwiperSlide key={item._id}>
            <div className="food-card">
              {item.video && <div className="add-badge">Ads</div>}

              <div className="food-image-wrapper">
                {openCardId === item._id && (
                  <div className="slot-popup-overlay">
                    <div className="slot-popup-content">
                      <h4>Select a Slot</h4>
                      <ul>
                        {Array.isArray(item.slots) && item.slots.map((slot) => (
                          <li
                            key={slot}
                            className={selectedSlots[item._id] === slot ? "selected" : ""}
                            onClick={() =>
                              setSelectedSlots({ ...selectedSlots, [item._id]: slot })
                            }
                          >
                            {slot}
                          </li>
                        ))}

                      </ul>
                      <button
                        onClick={() => {
                          setOpenCardId(null);

                          navigate("/order#", {
                            state: {
                              item,
                              category: "namkeen",
                              slot: selectedSlots[item._id],
                            },
                          });
                        }}
                        disabled={!selectedSlots[item._id]}
                      >
                        Set Time & Place Order
                      </button>

                    </div>
                  </div>
                )}
                {item.video && item.video.endsWith(".mp4") ? (
                  <video className="food-image" src={item.video} autoPlay loop muted playsInline preload="metadata" />
                ) : item.video2 && item.video2.endsWith(".mp4") ? (
                  <video className="food-image" src={item.video2} autoPlay loop muted playsInline preload="metadata" />
                ) : item.video2 && item.video2.includes("youtube.com") ? (
                  <iframe
                    className="food-image"
                    src={`${item.video2}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={item.title}
                  />

                ) : item.video2 ? (

                  <a href={item.video2} target="_blank" rel="noopener noreferrer">

                    <img src={item.image} alt={item.title} className="food-image" />

                  </a>
                ) : (
                  <img src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.title}
                    className="food-image"
                  />
                )}
                <div className="view-eye"><VscEye style={{ fontSize: "22px", color: "white", marginBottom: "-2px", cursor: "pointer" }} />{item.view}</div>
                <img className="top-icon" src={item.type === "veg" ? GreenArrow : RedArrow} alt="" />

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
                      onClick={() => setOpenCardId(openCardId === item._id ? null : item._id)}
                      style={{ marginTop: "-1px", cursor: "pointer" }}
                    />

                    <FaRegHeart
                      size={20}
                      color=""
                      title="Like"
                      style={{ cursor: "pointer" }}
                    />
                    <img src={SaveIcon} alt="Save" title="Book Mark" />
                    <img src={ShareIcon} alt="Share" title="Share" />
                  </div>
                </div>

                <h2>
                  {item.title} <span>({item.portion})</span>
                </h2>
                <p className="food-desc">{item.desc.slice(0, 60)}...</p>

                <div className="food-rating">
                  <img src={StarIcon} alt="" />
                  <h3>
                    {item.rating} <span>({item.reviews})</span>
                  </h3>
                  <p>{item.orders} orders last week</p>

                </div>

                <div className="food-price-row">
                  <span className="food-price">
                    <small className="Rs">₹</small> {item.price}
                  </span>
                  <span className="offer">
                    <small className="offer">₹</small>
                    {item.offer}
                  </span>
                  <span className="food-off">{item.off}% OFF</span>
                  {/* <p className="delivery-badge">
                    ⏱ {item.deliveryTime}
                  </p> */}


                </div>

                <div className="food-actions">
                  <button className="order-btn" onClick={() => placeOrder(item)}>
                    Place order
                  </button>
                  {/* <div className="add" onClick={() => increase(item)}>
                    <span className="add-text">
                      {item.quantity > 0 ? item.quantity : "ADD"}
                    </span>
                  </div> */}

                  <div className="add-btn">
                    <button onClick={() => decrease(item)}>-</button>
                    <span>{getQty(item)}</span>
                    <button onClick={() => increase(item)}>+</button>
                  </div>
                </div>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div >
  )
}

export default Namkeen
