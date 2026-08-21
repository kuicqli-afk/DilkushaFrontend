import React, { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { FaEye, FaRegHeart } from "react-icons/fa";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { useCart } from "../../Context/CartContext";
import { VscEye } from "react-icons/vsc";
import { LiaStopwatchSolid } from "react-icons/lia";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

const MaidaItems = ({
    selectedCategory,
    filter,
    sortBy,
    price,
    cuisine,
    category,
    subCategory,
    subCategoryName, // ✅ backward-compat — kuch jagah ye prop naam bhi use ho raha hoga
    isAll = false,
    excludeId,
}) => {
    const navigate = useNavigate();
    const swiperRef = useRef(null);

    const { cartItems, addToCart, updateQty, getCartKey } = useCart();

    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(""); // ✅ FIX: missing state add ki

    // ✅ FIX: dono prop naam accept karo, aur "all" ko string se bhi detect karo
    const effectiveSubCategory = subCategory ?? subCategoryName;
    const treatAsAll = isAll || category === "all";

    useEffect(() => {
        if (!category && !treatAsAll) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        let url = `${BASE_URL}/products/get-products`;
        let responseKey = "data";

        if (!treatAsAll && effectiveSubCategory) {
            url = `${BASE_URL}/products/subcategory-products/${encodeURIComponent(effectiveSubCategory)}`;
            responseKey = "products";
        } else if (!treatAsAll && category) {
            url = `${BASE_URL}/products/category-products/${encodeURIComponent(category)}`;
            responseKey = "products";
        }

        axios
            .get(url)
            .then((res) => {
                // ✅ FIX: setItems() ki jagah setList() — state naam consistent
                setList(res.data[responseKey] || []);
            })
            .catch((err) => {
                console.error(`Error fetching "${category}" products:`, err);
                setError("Could not load products.");
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [category, effectiveSubCategory, treatAsAll]);

    const baseFilteredList = useMemo(() => {
        let result = [...list];

        if (filter === "veg") {
            result = result.filter((item) => item.type === "veg");
        }

        if (filter === "nonveg") {
            result = result.filter((item) => item.type === "non-veg");
        }

        if (price) {
            const [min, max] = price.split("-").map(Number);
            result = result.filter((item) =>
                max ? item.price >= min && item.price <= max : item.price >= min
            );
        }

        if (cuisine) {
            result = result.filter((item) => item.cuisine === cuisine);
        }

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

    const excludedList = useMemo(() => {
        if (!excludeId) return baseFilteredList;
        return baseFilteredList.filter((item) => item._id !== excludeId);
    }, [baseFilteredList, excludeId]);

    const finalList = excludedList.length > 0 ? excludedList : baseFilteredList;

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

    const placeOrder = (item) => {
        navigate("/order", {
            state: {
                item,
                quantity: getQty(item),
                category: category || "all",
            },
        });
    };

    if (loading) return null;
    if (error) return null; // ✅ error case mein bhi section silently hide
    if (!finalList.length) return null;

    return (
        <div
            id={category ? category.toLowerCase().replace(/\s+/g, "-") : "category"}
            className="food-container"
        >
            <div className="food-text">
                <h1>{category}</h1>
                <p
                    className="view-all"
                    onClick={() => navigate(`/category/${encodeURIComponent(category)}`)}
                >
                    View all
                </p>
            </div>
            <Swiper
                modules={[Autoplay]}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                loop={finalList.length > 5}
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
                {finalList.map((item) => (
                    <SwiperSlide key={item._id}>
                        <div className="food-card">
                            {item.video && <div className="add-badge">Ads</div>}

                            <div className="food-image-wrapper">
                                {item.video && item.video.endsWith(".mp4") && (
                                    <video
                                        className="food-image"
                                        src={item.video}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                )}

                                {!item.video && (
                                    <img src={item.image} alt={item.title} className="food-image" />
                                )}

                                <div className="view-eye">
                                    <VscEye
                                        style={{
                                            fontSize: "22px",
                                            color: "white",
                                            marginBottom: "-2px",
                                            cursor: "pointer",
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
                                    <img
                                        src={
                                            item.isOpen === false ||
                                                (item.status && item.status.toLowerCase() === "offline")
                                                ? Close
                                                : Open
                                        }
                                        alt=""
                                    />
                                    <p>{item.status}</p>

                                    <div className="food-status-right-icon">
                                        <LiaStopwatchSolid
                                            size={24}
                                            color="#ff5722"
                                            title="Select Slot"
                                            onClick={() =>
                                                setOpenCardId(openCardId === item._id ? null : item._id)
                                            }
                                            style={{ marginTop: "-1px", cursor: "pointer" }}
                                        />
                                        <FaRegHeart size={20} title="Like" style={{ cursor: "pointer" }} />
                                        <img src={SaveIcon} alt="Save" title="Book Mark" />
                                        <img src={ShareIcon} alt="Share" title="Share" />
                                    </div>
                                </div>

                                <h2>
                                    {item.title} <span>({item.portion})</span>
                                </h2>

                                <p className="food-desc">
                                    {(item.desc || "").slice(0, 60)}...
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
                ))}
            </Swiper>
        </div>
    );
};

export default MaidaItems;