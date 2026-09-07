import React, { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { FaEye, FaRegHeart, FaCheckCircle, FaTimesCircle, FaSave, FaRegBookmark, FaStar } from "react-icons/fa";
import { FiGlobe, FiLock } from "react-icons/fi";
import "./Food.css";

import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { useCart } from "../../Context/CartContext";
import { VscEye } from "react-icons/vsc";
import { LiaStopwatchSolid } from "react-icons/lia";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

// Fisher-Yates shuffle — randomizes product order on every fresh page load/refresh
const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const MaidaItems = ({
    selectedCategory,
    filter,
    sortBy,
    price,
    cuisine,
    category,
    subCategory,
    subCategoryName,
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
    const [error, setError] = useState("");

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
                const fetched = res.data[responseKey] || [];
                setList(shuffleArray(fetched)); // random order every page load
            })
            .catch((err) => {
                console.error(`Error fetching "${category}" products:`, err);
                setError("Could not load products.");
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [category, effectiveSubCategory, treatAsAll]);

    // Stock helpers — quantity IS the ONLY stock field (single source of truth from admin panel).
    // "portion" is a plain description field ("Full", "Half", "500g" etc.) and never affects
    // stock — an earlier version here also checked portion==="0", which caused false
    // Out-of-Stock on products whose portion happened to contain "0" for unrelated reasons.
    // Old products saved before quantity existed have quantity === undefined —
    // treat those as unlimited stock so nothing that used to be orderable suddenly breaks.
    const getStock = (item) => {
        if (item.quantity === undefined || item.quantity === null || item.quantity === "") {
            return Infinity;
        }
        return Number(item.quantity) || 0;
    };
    // This single check now drives EVERYTHING — badge, icon, blur, and button disable.
    // Online/Offline (isOpen/status) is no longer used anywhere in this file.
    const isInStock = (item) => getStock(item) > 0;

    const baseFilteredList = useMemo(() => {
        let result = [...list];

        // Never show draft products to customers, even if the backend sent one through
        result = result.filter((item) => !item.isDraft && item.status !== "Draft");

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
        // Don't allow adding more than what's actually in stock
        if (!isInStock(item)) return;

        const stock = getStock(item);
        const currentQty = getQty(item);
        const currentNum = currentQty === "ADD" ? 0 : Number(currentQty);
        if (currentNum >= stock) return; // already at max available stock

        addToCart(item, 1);
    };

    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        if (!found) return;
        updateQty(key, found.quantity - 1);
    };

    const placeOrder = (item) => {
        if (!isInStock(item)) return; // guard — no ordering out-of-stock items

        navigate("/order", {
            state: {
                item,
                quantity: getQty(item),
                category: category || "all",
            },
        });
    };

    if (loading) return null;
    if (error) return null;
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
                {finalList.map((item) => {
                    // per-card stock computation — the ONLY thing that decides availability now
                    const stock = getStock(item);
                    const inStock = isInStock(item);
                    const cartQty = getQty(item);
                    const cartQtyNum = cartQty === "ADD" ? 0 : Number(cartQty);
                    const atMaxStock = stock !== Infinity && cartQtyNum >= stock;
                    // 🆕 Public/Private marketplace visibility — defaults to public if not set
                    const isPublic = item.visibility !== "private";

                    return (
                        <SwiperSlide key={item._id}>
                            <div className={`food-card${!inStock ? " out-of-stock" : ""}`}>
                                {item.video && <div className="add-badge">Ads</div>}

                                <div className="food-image-wrapper">
                                    {item.video && item.video.endsWith(".mp4") && (
                                        <video
                                            className={`food-image${!inStock ? " blurred" : ""}`}
                                            src={item.video}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    )}

                                    {!item.video && (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className={`food-image${!inStock ? " blurred" : ""}`}
                                        />
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
                                        {/* Stock-based tick / cross */}
                                        {inStock ? (
                                            <FaCheckCircle className="stock-icon in-stock-icon" title="In Stock" />
                                        ) : (
                                            <FaTimesCircle className="stock-icon out-stock-icon" title="Out of Stock" />
                                        )}
                                        <p className={inStock ? "stock-text-in" : "stock-text-out"}>
                                            {inStock ? "In Stock" : "Out of Stock"}
                                        </p>

                                        {/* 🆕 Public/Private visibility badge */}
                                        <span
                                            className={`visibility-badge ${isPublic ? "visibility-public" : "visibility-private"}`}
                                            title={isPublic ? "Public — marketplace + website" : "Private — website only"}
                                        >
                                            {isPublic ? <FiGlobe size={11} /> : <FiLock size={11} />}
                                            {isPublic ? "Public" : "Private"}
                                        </span>

                                        <div className="food-status-right-icon">

                                            <FaRegHeart size={16} title="Like" style={{ cursor: "pointer" }} />
                                            <FaRegBookmark
                                                size={16}
                                                title="Add to cart"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    if (inStock && !atMaxStock) {
                                                        addToCart(item, 1);
                                                    }
                                                }}
                                            />

                                        </div>
                                    </div>

                                    <h2>
                                        {item.title} <span>{item.weight}{item.unit}</span>
                                    </h2>

                                    <p className="food-desc">
                                        {(item.desc || "").slice(0, 60)}...
                                    </p>

                                    <div className="food-rating">
                                        <span className="rating-number">{item.rating || 0}</span>
                                        <span className="rating-stars">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <FaStar
                                                    key={n}
                                                    className={
                                                        n <= Math.round(item.rating || 0)
                                                            ? "star-filled"
                                                            : "star-empty"
                                                    }
                                                />
                                            ))}
                                        </span>
                                        <span className="rating-reviews">({item.reviews || 0})</span>
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

                                    <div className="food-actions">
                                        <button
                                            className="order-btn"
                                            onClick={() => placeOrder(item)}
                                            disabled={!inStock}
                                        >
                                            {inStock ? "Place order" : "Out of Stock"}
                                        </button>
                                        <div className="add-btn">
                                            <button onClick={() => decrease(item)} disabled={!inStock}>
                                                -
                                            </button>
                                            <span>{getQty(item)}</span>
                                            <button
                                                onClick={() => increase(item)}
                                                disabled={!inStock || atMaxStock}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};

export default MaidaItems;