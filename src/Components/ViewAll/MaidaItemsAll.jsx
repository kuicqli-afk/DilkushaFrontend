import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import ViewAllSlider from "../Slider/ViewAllSlider";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { VscEye } from "react-icons/vsc";
import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";


const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

function MaidaItemsAll({ categoryCode, subCategoryCode, isAll, showBanner = true }) {
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQty, getCartKey } = useCart();
    const [openCardId, setOpenCardId] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const params = useParams();

    // Safely fallback across all potential route parameter names
    const category = categoryCode ?? params.categoryCode ?? params.categoryName ?? params.category;
    const subCategory = subCategoryCode ?? params.subCategoryCode ?? params.subCategoryName ?? params.subCategory;

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
            .then((res) => setItems(res.data[responseKey] || []))
            .catch((err) => {
                console.log(err);
                setError("Could not load products.");
            })
            .finally(() => setLoading(false));
    }, [category, subCategory, isAll]);

    const getQty = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        return found ? found.quantity : "ADD";
    };

    const increase = (item) => addToCart(item, 1);
    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        if (found) updateQty(key, found.quantity - 1);
    };

    const placeOrder = (item) =>
        navigate("/order", { state: { item, category: category || "all" } });

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
                <div id="mixnamkeen" className="food-text">
                    {/* <h1>{isAll ? "All Products" : category || subCategory}</h1> */}
                </div>

                <div className="food-card-grid">
                    {items.map((item) => (
                        <div key={item._id} className="food-card">
                            <div className="food-image-wrapper">
                                {(item.video || item.video2) && (
                                    <div className="add-badge">Ads</div>
                                )}

                                {item.video && item.video.endsWith(".mp4") ? (
                                    <video
                                        className="food-image"
                                        src={item.video}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : item.video2 && item.video2.endsWith(".mp4") ? (
                                    <video
                                        className="food-image"
                                        src={item.video2}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : item.video2 && item.video2.includes("youtube.com") ? (
                                    <iframe
                                        className="food-image"
                                        src={`${item.video2}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1`}
                                        frameBorder="0"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                        title={item.title}
                                    />
                                ) : (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="food-image"
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
                                    <img src={item.isOpen === false || (item.status && item.status.toLowerCase() === 'offline') ? Close : Open} alt="" />
                                    <p>{item.status}</p>
                                    <div className="food-status-right-icon">
                                        <LiaStopwatchSolid
                                            size={24}
                                            color="#ff5722"
                                            title="Select Slot"
                                            onClick={() =>
                                                setOpenCardId(openCardId === item._id ? null : item._id)
                                            }
                                            style={{ cursor: "pointer" }}
                                        />
                                        <FaRegHeart size={20} title="Like" style={{ cursor: "pointer" }} />
                                        <img src={SaveIcon} alt="Save" title="Book Mark" />
                                        <img src={ShareIcon} alt="Share" title="Share" />
                                    </div>
                                </div>

                                <h2>
                                    {item.title} <span>({item.portion})</span>
                                </h2>
                                <p className="food-desc">{(item.desc || "").slice(0, 60)}...</p>

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
                    ))}
                </div>
            </div>
        </>
    );
}

export default MaidaItemsAll;