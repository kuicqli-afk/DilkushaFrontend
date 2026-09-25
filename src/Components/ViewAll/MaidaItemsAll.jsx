import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WishlistContext";
import ViewAllSlider from "../Slider/ViewAllSlider";
import "../Food/Food.css";

import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";

import {
    FaCheckCircle,
    FaTimesCircle,
    FaBookmark,
    FaRegBookmark,
    FaStar,
    FaHeart,
    FaRegHeart
} from "react-icons/fa";
import { FiGlobe, FiLock } from "react-icons/fi";
import { VscEye } from "react-icons/vsc";

const BASE_URL = "https://backend.shyamnamkeenandbakers.online/api";

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
    if (typeof item.image === "string" && item.image) return [item.image];
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

function MaidaItemsAll({ categoryCode, subCategoryCode, isAll, showBanner = true }) {
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQty, getCartKey } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // State for continuous automatic image sliding & dot indicators
    const [activeImageIndices, setActiveImageIndices] = useState({});

    const params = useParams();

    // Safely fallback across all potential route parameter names
    const category = categoryCode ?? params.categoryCode ?? params.categoryName ?? params.category;
    const subCategory = subCategoryCode ?? params.subCategoryCode ?? params.subCategoryName ?? params.subCategory;

    const guestId = useMemo(() => getGuestId(), []);

    const handleToggleLike = async (productId, e) => {
        e.stopPropagation();
        try {
            // 1. UI ko turant update karo (Optimistic Update)
            setItems((prev) =>
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
        setLoading(true);
        setError("");

        let url = `${BASE_URL}/products/get-products`;
        let responseKey = "data";

        if (!isAll && subCategory) {
            url = `${BASE_URL}/products/subcategory-products/${encodeURIComponent(subCategory)}`;
            responseKey = "products";
        } else if (!isAll && category) {
            url = `${BASE_URL}/products/category-products/${encodeURIComponent(category)}`;
            responseKey = "products";
        }

        axios
            .get(url)
            .then((res) => {
                const fetched = res.data[responseKey] || [];
                // Filter out drafts & randomize
                const activeItems = fetched.filter((item) => !item.isDraft && item.status !== "Draft");
                setItems(shuffleArray(activeItems));
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setError("Could not load products.");
            })
            .finally(() => setLoading(false));
    }, [category, subCategory, isAll]);

    // Continuous automatic background sliding effect for cards with multiple images
    useEffect(() => {
        if (!items || items.length === 0) return;

        const interval = setInterval(() => {
            setActiveImageIndices((prev) => {
                const next = { ...prev };
                items.forEach((item) => {
                    const images = getItemImages(item);
                    if (images.length > 1) {
                        const current = prev[item._id] || 0;
                        next[item._id] = (current + 1) % images.length;
                    }
                });
                return next;
            });
        }, 2200);

        return () => clearInterval(interval);
    }, [items]);

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
        setItems((prev) =>
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

    const bannerCategory = !isAll && showBanner ? (category || subCategory) : null;

    if (loading) {
        return (
            <>
                {bannerCategory && <ViewAllSlider category={bannerCategory} />}
                <div className="food-container">
                    <p>Loading products...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                {bannerCategory && <ViewAllSlider category={bannerCategory} />}
                <div className="food-container">
                    <p>{error}</p>
                </div>
            </>
        );
    }

    if (!items.length) {
        return (
            <>
                {bannerCategory && <ViewAllSlider category={bannerCategory} />}
                <div className="food-container">
                    <p>No products found.</p>
                </div>
            </>
        );
    }

    return (
        <>
            {bannerCategory && <ViewAllSlider category={bannerCategory} />}
            <div className="food-container">
                <div className="food-card-grid">
                    {items.map((item) => {
                        const stock = getStock(item);
                        const inStock = isInStock(item);
                        const isPublic = item.visibility !== "private";
                        const currentRating = Number(item.rating) || 0;
                        const ordersCount = item.orders ?? 0;

                        // Extract image array supporting item.images or fallback to single image
                        const images = getItemImages(item);
                        const currentImgIdx = activeImageIndices[item._id] || 0;
                        const activeVideo = item.video || item.video2;
                        const isYouTube = activeVideo && activeVideo.includes("youtube.com");
                        const isMp4 = activeVideo && activeVideo.endsWith(".mp4");

                        return (
                            <div key={item._id} className={`food-card${!inStock ? " out-of-stock" : ""}`}>
                                {activeVideo && <div className="add-badge">Ads</div>}

                                <div className="food-image-wrapper">
                                    {isMp4 ? (
                                        <video
                                            className={`food-image${!inStock ? " blurred" : ""}`}
                                            src={activeVideo}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : isYouTube ? (
                                        <iframe
                                            className={`food-image${!inStock ? " blurred" : ""}`}
                                            src={`${activeVideo}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1`}
                                            frameBorder="0"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                            title={item.title}
                                        />
                                    ) : (
                                        <>
                                            <img
                                                src={images[currentImgIdx] || images[0] || (typeof item.image === "string" ? item.image : "")}
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
                                        {item.title} <span>{item.weight ? `${item.weight}${item.unit || ""}` : item.portion ? `(${item.portion})` : ""}</span>
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
                                            {inStock ? "Shop Now" : "Out of Stock"}
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
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default MaidaItemsAll;