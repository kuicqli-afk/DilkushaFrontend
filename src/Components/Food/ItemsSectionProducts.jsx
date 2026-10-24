import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaRegHeart } from "react-icons/fa";
import { VscEye } from "react-icons/vsc";
import { LiaStopwatchSolid } from "react-icons/lia";
import "../Food/Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import Slider from "../Slider/Slider";
import Category from "../Category/Category";
import Button from "./Button";
import { useCart } from "../../Context/CartContext";
import AnimatedText from "../Motion/AnimatedText";
import { ProductGridSkeleton } from "../Skeleton/Skeleton";
import { optimizeImage } from "../../utils/image";
import { PressButton, ProductCard, RevealImage, SplitWords } from "../Motion/motionKit";

const API_URL = "https://backend.shyamnamkeenandbakers.online";

// ✅ Tag → display title mapping.
const TAG_TITLES = {
    trending: "Hot & Trending Food Offers",
    combo: "Combo Deals",
    "weekend-special": "Weekend Special",
    offers: "Special Offers",
};

const formatTitle = (tag = "") =>
    TAG_TITLES[tag] ||
    tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getVideoSource = (item) => item.video2 || item.video || "";

const isMp4 = (src) => {
    if (!src) return false;
    return String(src).toLowerCase().includes(".mp4");
};

function ItemsSectionProducts({ tag: propTag }) {
    const params = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart, updateQty, getCartKey } = useCart();

    const tag = propTag || params.tag || "trending";

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});

    // Filter & Sort States
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("");
    const [price, setPrice] = useState("");
    const [cuisine, setCuisine] = useState("");

    // ✅ FETCH — Sirf isi tag ke products
    useEffect(() => {
        if (!tag) return;
        setLoading(true);
        axios
            .get(`${API_URL}/api/products?tag=${encodeURIComponent(tag)}`)
            .then((res) => {
                const products = res.data?.products || res.data?.data || [];
                setList(Array.isArray(products) ? products : []);
            })
            .catch((err) => {
                console.error("Fetch Section Products Error:", err);
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [tag]);

    // ✅ Filter & Sort Logic
    const filteredList = useMemo(() => {
        let result = [...list];

        // Veg / Non-Veg
        if (filter === "veg") {
            result = result.filter((item) => item.type === "veg");
        }
        if (filter === "nonveg") {
            result = result.filter(
                (item) => item.type === "non-veg" || item.type === "nonveg"
            );
        }

        // Price
        if (price) {
            const [min, max] = price.split("-").map(Number);
            result = result.filter((item) =>
                max ? item.price >= min && item.price <= max : item.price >= min
            );
        }

        // Cuisine
        if (cuisine) {
            result = result.filter((item) => item.cuisine === cuisine);
        }

        // Sorting
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

    const getQty = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        return found ? found.quantity : "ADD";
    };

    const increase = (item) => addToCart(item, 1);
    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        if (!found) return;
        updateQty(key, found.quantity - 1);
    };

    const placeOrder = (item) =>
        navigate("/order", {
            state: {
                item,
                quantity: getQty(item),
                category: tag,
                slot: selectedSlots[item._id],
            },
        });

    return (
        <div>
            {/* 1. Category / Section Top Promotional Banner */}
            {/* 1. Generic Home Page Slider */}
            <Slider />

            {/* 2. Category Navigation Bar */}
            <Category />

            {/* 3. Filter & Sort Buttons */}
            <Button
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                price={price}
                setPrice={setPrice}
                cuisine={cuisine}
                setCuisine={setCuisine}
            />

            <div className="food-container">
                <div className="food-text">
                    <AnimatedText as="h1" text={formatTitle(tag)} />
                </div>

                {loading ? (
                    <ProductGridSkeleton />
                ) : filteredList.length === 0 ? (
                    <div className="no-offers">
                        <p>No products found in "{formatTitle(tag)}" right now.</p>
                    </div>
                ) : (
                    <div className="food-card-grid">
                        {filteredList.map((item) => {
                            const videoSrc = getVideoSource(item);
                            const hasVideo = Boolean(videoSrc);

                            return (
                                <ProductCard key={item._id} className="food-card">

                                    {/* Image / Video Media Wrapper */}
                                    <div className="food-image-wrapper">
                                        {hasVideo && <div className="add-badge">Ads</div>}

                                        {hasVideo ? (
                                            isMp4(videoSrc) ? (
                                                <video
                                                    className="food-images"
                                                    src={videoSrc}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                    poster={item.image}
                                                />
                                            ) : (
                                                <iframe
                                                    className="food-images"
                                                    src={videoSrc}
                                                    title={item.title}
                                                    frameBorder="0"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                />
                                            )
                                        ) : (
                                            <RevealImage
                                                src={optimizeImage(item.image, 720)}
                                                alt={item.title}
                                                className="food-images"
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
                                            alt="food-type"
                                        />
                                    </div>

                                    {/* Food Info */}
                                    <div className="food-info">
                                        <div className="food-status-left">
                                            <img
                                                src={
                                                    item.isOpen === false ||
                                                        (item.status &&
                                                            item.status.toLowerCase() === "offline")
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
                                                        setOpenCardId(
                                                            openCardId === item._id ? null : item._id
                                                        )
                                                    }
                                                    style={{ marginTop: "-1px", cursor: "pointer" }}
                                                />
                                                <FaRegHeart
                                                    size={20}
                                                    title="Like"
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <img src={SaveIcon} alt="Save" title="Bookmark" />
                                                <img src={ShareIcon} alt="Share" title="Share" />
                                            </div>
                                        </div>

                                        <h2>
                                            <SplitWords text={item.title} /> <span>({item.portion})</span>
                                        </h2>

                                        <p className="food-desc">
                                            <SplitWords text={`${(item.desc || "").slice(0, 70)}...`} />
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
                                            <PressButton
                                                className="order-btn"
                                                onClick={() => placeOrder(item)}
                                            >
                                                Place order
                                            </PressButton>
                                            <div className="add-btn">
                                                <PressButton onClick={() => decrease(item)}>-</PressButton>
                                                <span>{getQty(item)}</span>
                                                <PressButton onClick={() => increase(item)}>+</PressButton>
                                            </div>
                                        </div>
                                    </div>
                                </ProductCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ItemsSectionProducts;