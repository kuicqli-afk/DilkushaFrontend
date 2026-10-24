import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaTrash } from "react-icons/fa";
import { useWishlist } from "../../Context/WishlistContext";
import { useCart } from "../../Context/CartContext";
import "./Wishlist.css";
import { optimizeImage } from "../../utils/image";
import { RevealImage } from "../Motion/motionKit";

const WishlistPage = () => {
    const { wishlistItems, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    if (!wishlistItems || wishlistItems.length === 0) {
        return (
            <div className="wishlist-empty">
                <FaBookmark size={50} color="#ff4757" />
                <h2>Your Wishlist is Empty</h2>
                <p>Save items by tapping the bookmark icon on any product.</p>
                <button className="navigate" onClick={() => navigate("/")}>
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <h1>My Wishlist ({wishlistItems.length})</h1>
            <div className="wishlist-grid">
                {wishlistItems.map((item, index) => (
                    <div className="wishlist-card" key={item._id || item.id || index}>
                        <div
                            className="wishlist-image-container"
                            onClick={() => navigate(`/order/${item._id}`, { state: { item } })}
                            style={{ cursor: "pointer" }}
                        >
                            <RevealImage src={optimizeImage(item.image, 400)} alt={item.title || "Product"} loading="lazy" decoding="async" />
                        </div>
                        <div className="wishlist-info">
                            <h3
                                onClick={() => navigate(`/order/${item._id}`, { state: { item } })}
                                style={{ cursor: "pointer" }}
                            >
                                {item.title}
                            </h3>
                            <p className="wishlist-price">₹{item.price}</p>
                            <div className="wishlist-actions">
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => {
                                        addToCart(item, 1);
                                        navigate(`/order/${item._id}`, { state: { item } });
                                    }}
                                >
                                    Place Order
                                </button>
                                <FaTrash
                                    className="remove-icon"
                                    title="Remove"
                                    onClick={() => toggleWishlist(item)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;