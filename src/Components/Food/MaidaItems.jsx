import React, { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import { FaEye, FaRegHeart, FaCheckCircle, FaTimesCircle, FaSave, FaBookmark, FaRegBookmark, FaStar } from "react-icons/fa";
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

import { useWishlist } from "../../Context/WishlistContext";

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
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State for continuous automatic image sliding & dot indicators
    const [activeImageIndices, setActiveImageIndices] = useState({});

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
                setList(shuffleArray(fetched));
            })
            .catch((err) => {
                console.error(`Error fetching "${category}" products:`, err);
                setError("Could not load products.");
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [category, effectiveSubCategory, treatAsAll]);

    // Continuous automatic background sliding effect for cards with multiple images
    useEffect(() => {
        if (!list || list.length === 0) return;

        const interval = setInterval(() => {
            setActiveImageIndices((prev) => {
                const next = { ...prev };
                list.forEach((item) => {
                    const images = item.images && item.images.length > 0 
                        ? item.images 
                        : [item.image].filter(Boolean);
                    if (images.length > 1) {
                        const current = prev[item._id] || 0;
                        next[item._id] = (current + 1) % images.length;
                    }
                });
                return next;
            });
        }, 2200); // Changes image automatically every 2.2 seconds without needing hover

        return () => clearInterval(interval);
    }, [list]);

    const handleDotClick = (itemId, index, e) => {
        e.stopPropagation();
        setActiveImageIndices((prev) => ({ ...prev, [itemId]: index }));
    };

    const getStock = (item) => {
        if (item.quantity === undefined || item.quantity === null || item.quantity === "") {
            return Infinity;
        }
        return Number(item.quantity) || 0;
    };

    const isInStock = (item) => getStock(item) > 0;

    const baseFilteredList = useMemo(() => {
        let result = [...list];

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
        if (!isInStock(item)) return;

        const stock = getStock(item);
        const currentQty = getQty(item);
        const currentNum = currentQty === "ADD" ? 0 : Number(currentQty);

        if (currentNum >= 10) {
            alert("You can add a maximum of 10 items.");
            return;
        }

        if (currentNum >= stock) {
            alert(`Only ${stock} items available in stock.`);
            return;
        }

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
                    const stock = getStock(item);
                    const inStock = isInStock(item);
                    const isPublic = item.visibility !== "private";

                    const currentRating = Number(item.rating) || 0;
                    const ordersCount = item.orders ?? 0;

                    // Extract image array supporting item.images or fallback to single image
                    const images = item.images && item.images.length > 0 
                        ? item.images 
                        : [item.image].filter(Boolean);
                    const currentImgIdx = activeImageIndices[item._id] || 0;
                    const isVideo = item.video && item.video.endsWith(".mp4");

                    return (
                        <SwiperSlide key={item._id}>
                            <div className={`food-card${!inStock ? " out-of-stock" : ""}`}>
                                {item.video && <div className="add-badge">Ads</div>}

                                <div className="food-image-wrapper">
                                    {isVideo ? (
                                        <video
                                            className={`food-image${!inStock ? " blurred" : ""}`}
                                            src={item.video}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : (
                                        <>
                                            <img
                                                src={images[currentImgIdx] || item.image}
                                                alt={item.title}
                                                className={`food-image slide-transition${!inStock ? " blurred" : ""}`}
                                            />
                                            {images.length > 1 && (
                                                <div className="card-dots-container">
                                                    {images.map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`card-dot ${idx === currentImgIdx ? 'active' : ''}`}
                                                            onClick={(e) => handleDotClick(item._id, idx, e)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
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
                                        {inStock ? (
                                            <FaCheckCircle className="stock-icon in-stock-icon" title="In Stock" />
                                        ) : (
                                            <FaTimesCircle className="stock-icon out-stock-icon" title="Out of Stock" />
                                        )}
                                        <p className={inStock ? "stock-text-in" : "stock-text-out"}>
                                            {inStock ? "In Stock" : "Out of Stock"}
                                        </p>

                                        <span
                                            className={`visibility-badge ${isPublic ? "visibility-public" : "visibility-private"}`}
                                            title={isPublic ? "Public — marketplace + website" : "Private — website only"}
                                        >
                                            {isPublic ? <FiGlobe size={11} /> : <FiLock size={11} />}
                                            {isPublic ? "Public" : "Private"}
                                        </span>

                                        <div className="food-status-right-icon">
                                            <FaRegHeart size={16} title="Like" style={{ cursor: "pointer" }} />
                                            {isInWishlist(item) ? (
                                                <FaBookmark
                                                    size={16}
                                                    title="Saved to Wishlist"
                                                    style={{ cursor: "pointer", color: "#ff4757" }}
                                                    onClick={() => toggleWishlist(item)}
                                                />
                                            ) : (
                                                <FaRegBookmark
                                                    size={16}
                                                    title="Save to Wishlist"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => toggleWishlist(item)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <h2>
                                        {item.title} <span>{item.weight}{item.unit}</span>
                                    </h2>

                                    <p className="food-desc">
                                        {(item.desc || "").slice(0, 60)}...
                                    </p>

                                    <div className="food-rating">
                                        <span className="rating-number">{currentRating.toFixed(1)}</span>
                                        <span className="rating-stars">
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <FaStar
                                                    key={n}
                                                    className={
                                                        n <= Math.round(currentRating)
                                                            ? "star-filled"
                                                            : "star-empty"
                                                    }
                                                />
                                            ))}
                                        </span>
                                        <span className="rating-reviews">({item.reviews || 0})</span>
                                        <span className="rating-dot">•</span>
                                        <span className="orders-last-week">
                                            {ordersCount} order{ordersCount === 1 ? "" : "s"} last week
                                        </span>
                                    </div>

                                    <div className="food-price-row">
                                        <span className="food-price">
                                            <small className="Rs">₹</small>
                                            {item.offer}
                                        </span>

                                        {item.offer > 0 && (
                                            <span className="offer">
                                                <span>M.R.P.</span>
                                                <small className="offer-price">₹{item.price}</small>
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
                                            {inStock ? "View More" : "Out of Stock"}
                                        </button>
                                        <div className="add-btn">
                                            <button onClick={() => decrease(item)} disabled={!inStock}>
                                                -
                                            </button>
                                            <span>{getQty(item)}</span>
                                            <button
                                                onClick={() => increase(item)}
                                                disabled={!inStock}
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