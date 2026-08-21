import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import biryaniList from "../../data/BiryaniData";
import { FaEye, FaRegHeart } from "react-icons/fa";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { FaRegEye } from "react-icons/fa6";

const Biryani = () => {
    const navigate = useNavigate();
    const [qty, setQty] = useState({});
    const swiperRef = useRef(null);

    const increase = (id) =>
        setQty((p) => ({ ...p, [id]: (p[id] || 1) + 1 }));
    const decrease = (id) =>
        setQty((p) => ({ ...p, [id]: p[id] > 1 ? p[id] - 1 : 1 }));

    const placeOrder = (item) =>
        navigate("/order#", {
            state: {
                item,
                quantity: qty[item.id] || 1,
                category: "biryani",
            },
        });

    const list = useMemo(() => biryaniList, []);

    return (
        <div id="biryani" className="food-container">
            <div className="food-text">
                <h1>Biryani</h1>
                <p className="view-all">View all</p>
            </div>

            <Swiper
                modules={[FreeMode, Autoplay]}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                freeMode
                loop
                speed={1000}
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: fasle,
                }}
                spaceBetween={25}
                breakpoints={{
                    0: { slidesPerView: 1 },
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                }}
                className="food-card-row"
            >
                {list.map((item) => (
                    <SwiperSlide key={item.id}>
                        <div className="food-card">

                            {/* VIDEO CARD */}
                            <div className="food-image-wrapper">
                                <video
                                    className="food-video"
                                    src={item.video}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                />
                                <iframe className="food-images" src="https://www.instagram.com/p/DRwxZMgEmYW/" frameborder="0"></iframe>

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
                                        <FaRegEye style={{ fontSize: "22px", marginTop: "-2.1px", cursor: "pointer" }} />
                                        <FaRegHeart style={{ fontSize: "19px", cursor: "pointer" }} />
                                        <img src={SaveIcon} alt="" />
                                        <img src={ShareIcon} alt="" />
                                    </div>
                                </div>

                                <h2>
                                    {item.title} <span>({item.portion})</span>
                                </h2>

                                <p className="food-desc">
                                    {item.desc.slice(0, 70)}...
                                </p>

                                <div className="food-rating">
                                    <img src={StarIcon} alt="" />
                                    <h3>
                                        {item.rating} <span>({item.reviews})</span>
                                    </h3>
                                    <p>{item.orders} orders last week</p>
                                </div>

                                <div className="food-price-row">
                                    <span className="food-price">
                                        <small>₹</small> {item.price}
                                    </span>
                                    <span className="offer">
                                        <small>₹</small> {item.offer}
                                    </span>
                                    <span className="food-off">{item.off}% OFF</span>
                                </div>

                                <div className="food-actions">
                                    <button
                                        className="order-btn"
                                        onClick={() => placeOrder(item)}
                                    >
                                        Place order
                                    </button>

                                    <div className="add-btn">
                                        <button onClick={() => decrease(item.id)}>-</button>
                                        <span>{qty[item.id] || 1}</span>
                                        <button onClick={() => increase(item.id)}>+</button>
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

export default Biryani;
