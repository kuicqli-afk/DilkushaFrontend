import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import pattiesList from "../../data/PattiesData";

import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";
import { VscEye } from "react-icons/vsc";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { useCart } from "../../Context/CartContext";

const Patties = ({ filter, sortBy, price, cuisine }) => {

    const navigate = useNavigate();
    const swiperRef = useRef(null);

    const { cartItems, addToCart, updateQty, getCartKey } = useCart();

    const list = useMemo(() => pattiesList, []);
    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});

    const filteredList = useMemo(() => {
        let result = [...list];

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
    }, [list, filter, price, cuisine, sortBy]);

    const getQty = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find(x => x.key === key);
        return found ? found.quantity : ("ADD");
    };

    const increase = (item) => addToCart(item, 1);

    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find(x => x.key === key);
        if (!found) return;
        updateQty(key, found.quantity - 1);
    };

    const placeOrder = (item) =>
        navigate("/order#", {
            state: { item, category: "patties" },
        });

    return (
        <div id="patties" className="food-container">
            <div className="food-text">
                <h1>Patties</h1>
                <p className="view-all">View all</p>
            </div>
            {/* <div>
                {filteredList.length === 0 && (
                    <p style={{
                        color: "#ff4d4f",
                        fontSize: "22px",
                        fontWeight: "600",
                        paddingTop: "50px",
                        textAlign: "center",
                        fontFamily: "'Comic Sans MS', cursive, sans-serif"
                    }}>
                        {filter
                            ? `${filter === "veg" ? "Veg" : "Non-Veg"} Sweets Not Found`
                            : "No Sweets Found"}
                    </p>
                )}
            </div> */}
            <Swiper
                modules={[Autoplay]}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                loop={filteredList.length > 3}
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
                    <SwiperSlide key={item.id}>
                        <div className="food-card">
                            {item.video && <div className="add-badge">Ads</div>}

                            <div className="food-image-wrapper">
                                {openCardId === item.id && (
                                    <div className="slot-popup-overlay">
                                        <div className="slot-popup-content">
                                            <h4>Select a Slot</h4>
                                            <ul>
                                                {item.slots?.map((slot) => (
                                                    <li
                                                        key={slot}
                                                        className={selectedSlots[item.id] === slot ? "selected" : ""}
                                                        onClick={() =>
                                                            setSelectedSlots({ ...selectedSlots, [item.id]: slot })
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
                                                            category: "patties",
                                                            slot: selectedSlots[item.id],
                                                        },
                                                    });
                                                }}
                                            >
                                                Set Time & Place Order
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {item.video?.endsWith(".mp4") ? (
                                    <video className="food-image" src={item.video} autoPlay loop muted playsInline />
                                ) : (
                                    <img src={item.image} alt={item.title} className="food-image" />
                                )}

                                <div className="view-eye">
                                    <VscEye style={{ fontSize: "22px", color: "white" }} />
                                    {item.view}
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
                                            onClick={() => setOpenCardId(openCardId === item.id ? null : item.id)}
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

                                <h2>{item.title} <span>({item.portion})</span></h2>
                                <p className="food-desc">{item.desc.slice(0, 60)}...</p>

                                <div className="food-rating">
                                    <img src={StarIcon} alt="" />
                                    <h3>{item.rating} <span>({item.reviews})</span></h3>
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
                                </div>

                                <div className="food-actions">
                                    <button className="order-btn" onClick={() => placeOrder(item)}>
                                        Place order
                                    </button>

                                    {/* <div className="add" onClick={() => increase(item)}>
                                        ADD
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
        </div>
    );
};

export default Patties;
