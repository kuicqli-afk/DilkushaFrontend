import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import { FiTrash2, FiArrowRight } from "react-icons/fi";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext";
import "./Wishlist.css";
import { optimizeImage } from "../../utils/image";
import { RevealImage } from "../Motion/motionKit";

// how long a removed card takes to fade out (matches Wishlist.css)
const LEAVE_MS = 260;

const WishlistPage = () => {
    const { wishlistItems, toggleWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    // cards fading out before they're actually removed
    const [leaving, setLeaving] = useState({});
    const leaveTimers = useRef([]);

    useEffect(() => () => leaveTimers.current.forEach(clearTimeout), []);

    const itemKey = (item, index) => item._id || item.id || index;

    const removeAnimated = (item, key) => {
        if (leaving[key]) return;
        setLeaving((prev) => ({ ...prev, [key]: true }));
        leaveTimers.current.push(
            setTimeout(() => {
                // remove (never re-add): toggle only for an item saved without a key
                if (item.key) removeFromWishlist(item.key);
                else toggleWishlist(item);
                setLeaving((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            }, LEAVE_MS)
        );
    };

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="wishlist-empty" data-no-reveal>
                <div className="wishlist-empty-icon">
                    <FaBookmark aria-hidden="true" />
                </div>
                <h2>Your Wishlist is Empty</h2>
                <p>Save items by tapping the bookmark icon on any product.</p>
                <button type="button" className="navigate" onClick={() => navigate("/")}>
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="wishlist-container" data-no-reveal>
            <div className="wishlist-header">
                <h1>My Wishlist</h1>
                <span key={wishlistItems.length} className="wishlist-count">
                    {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
                </span>
            </div>

            <div className="wishlist-grid">
                {wishlistItems.map((item, index) => {
                    const key = itemKey(item, index);
                    const openItem = () => navigate(`/order/${item._id}`, { state: { item } });
                    return (
                        <div
                            className={`wishlist-card ${leaving[key] ? "is-leaving" : ""}`}
                            key={key}
                            style={{ "--i": Math.min(index, 8) }}
                        >
                            <div className="wishlist-image-container" onClick={openItem}>
                                <RevealImage
                                    src={optimizeImage(item.image, 400)}
                                    alt={item.title || "Product"}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <button
                                    type="button"
                                    className="remove-icon"
                                    title="Remove from wishlist"
                                    aria-label="Remove from wishlist"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeAnimated(item, key);
                                    }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                            <div className="wishlist-info">
                                <h3 onClick={openItem}>{item.title}</h3>
                                <p className="wishlist-price">₹{item.price}</p>
                                <div className="wishlist-actions">
                                    <button
                                        type="button"
                                        className="add-to-cart-btn"
                                        onClick={() => {
                                            addToCart(item, 1);
                                            openItem();
                                        }}
                                    >
                                        Place Order <FiArrowRight aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WishlistPage;
