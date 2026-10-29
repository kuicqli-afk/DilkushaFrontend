import React, { useMemo, useRef, useState, useEffect } from "react";
import axios from "axios";

import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaRegHeart, FaCheckCircle, FaTimesCircle, FaSave, FaBookmark, FaRegBookmark, FaStar } from "react-icons/fa";
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


import { useWishlist } from "../../Context/WishlistContext";
import Reveal from "../Motion/Reveal";
import AnimatedText from "../Motion/AnimatedText";
import { ProductRowSkeleton } from "../Skeleton/Skeleton";
import { optimizeImage } from "../../utils/image";
import { PressButton, ProductCard, SplitWords } from "../Motion/motionKit";
import CardSlideshow from "../Motion/CardSlideshow";

const BASE_URL = "https://dilkushabackend.onrender.com/api";

// Fisher-Yates shuffle — randomizes product order on every fresh page load/refresh
const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const getItemImages = (item) => {
    if (Array.isArray(item.image) && item.image.length > 0) return item.image;
    if (item.images && item.images.length > 0) return item.images;
    return [];
};

const getGuestId = () => {
    let guestId = localStorage.getItem("shop_guest_id");
    if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("shop_guest_id", guestId);
    }
    return guestId;
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


    const effectiveSubCategory = subCategory ?? subCategoryName;
    const treatAsAll = isAll || category === "all";


    const guestId = useMemo(() => getGuestId(), []);

    const handleToggleLike = async (productId, e) => {
        e.stopPropagation();
        try {
            // 1. UI ko turant update karo (Optimistic Update)
            setList((prev) =>
                prev.map((item) => {
                    if (item._id === productId) {
                        const likedByList = item.likedBy || [];
                        const isLiked = likedByList.includes(guestId);
                        const updatedLikedBy = isLiked
                            ? likedByList.filter((id) => id !== guestId)
                            : [...likedByList, guestId];
                        return { ...item, likedBy: updatedLikedBy };
                    }
                    return item;
                })
            );

            // 2. Backend API call hit karo
            await axios.put(`${BASE_URL}/products/${productId}/like`, { guestId });
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };



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

        // 🆕 Fire-and-forget view increment — don't block navigation on it
        axios
            .put(`${BASE_URL}/products/${item._id}/increment-view`)
            .catch((err) => console.warn("View count update failed:", err.message));

        // 🆕 Optimistically update the local list so the eye-count badge
        // reflects the click immediately, without waiting for a refetch
        setList((prev) =>
            prev.map((p) =>
                p._id === item._id ? { ...p, view: (p.view || 0) + 1 } : p
            )
        );

        navigate(`/order/${item._id}`, {
            state: {
                item,
                quantity: getQty(item),
                category: category || "all",
            },
        });
    };
    if (loading) return <ProductRowSkeleton />;
    if (error) return null;
    if (!finalList.length) return null;

    return (
        <Reveal
            id={category ? category.toLowerCase().replace(/\s+/g, "-") : "category"}
            variant="fade"
            className="food-container"
        >
            <div className="food-text">
                <AnimatedText as="h1" text={category} />
                <Link
                    className="view-all"
                    to={`/category/${encodeURIComponent(category)}`}
                >
                    View all
                </Link>
            </div>
            <Swiper
                modules={[Autoplay]}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                loop={finalList.length > 5}
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
                    const images = getItemImages(item);
                    const isVideo = item.video && item.video.endsWith(".mp4");

                    return (
                        <SwiperSlide key={item._id}>
                            <ProductCard className={`food-card${!inStock ? " out-of-stock" : ""}`}>
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
                                        <CardSlideshow
                                            images={(images.length ? images : [""]).map((src) => optimizeImage(src, 720))}
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

                                        <div className="food-status-right-icon" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            {/* Like Icon + Count */}
                                            <div
                                                style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                                                onClick={(e) => handleToggleLike(item._id, e)}
                                            >
                                                {item.likedBy?.includes(guestId) ? (
                                                    <FaHeart
                                                        size={16}
                                                        title="Unlike"
                                                        style={{ color: "#ff4757" }}
                                                    />
                                                ) : (
                                                    <FaRegHeart
                                                        size={16}
                                                        title="Like"
                                                    />
                                                )}
                                                <span style={{ fontSize: "13px", fontWeight: "600" }}>
                                                    {item.likedBy?.length || 0}
                                                </span>
                                            </div>

                                            {/* Existing Wishlist Bookmark */}
                                            {isInWishlist(item) ? (
                                                <FaBookmark
                                                    size={16}
                                                    title="Saved to Wishlist"
                                                    style={{ cursor: "pointer", color: "#ff4757" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(item);
                                                    }}
                                                />
                                            ) : (
                                                <FaRegBookmark
                                                    size={16}
                                                    title="Save to Wishlist"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(item);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <h2>
                                        <SplitWords text={item.title} /> <span>{item.weight}{item.unit}</span>
                                    </h2>

                                    <p className="food-desc">
                                        <SplitWords text={`${(item.desc || "").slice(0, 60)}...`} />
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
                                        <PressButton
                                            className="order-btn"
                                            onClick={() => placeOrder(item)}
                                            disabled={!inStock}
                                        >
                                            {inStock ? "Shop Now" : "Out of Stock"}
                                        </PressButton>
                                        <div className="add-btn">
                                            <PressButton onClick={() => decrease(item)} disabled={!inStock}>
                                                -
                                            </PressButton>
                                            <span>{getQty(item)}</span>
                                            <PressButton
                                                onClick={() => increase(item)}
                                                disabled={!inStock}
                                            >
                                                +
                                            </PressButton>
                                        </div>
                                    </div>
                                </div>
                            </ProductCard>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </Reveal>
    );
};

export default MaidaItems;