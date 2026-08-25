import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Food.css";

import Open from "../../assets/Open.png";
import Close from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
import StarIcon from "../../assets/StarIcon.png";

import { useParams } from "react-router-dom";
import axios from "axios";
import { FaRegHeart } from "react-icons/fa";
import { LiaStopwatchSolid } from "react-icons/lia";
import { VscEye } from "react-icons/vsc";

import "swiper/css";

import { useCart } from "../../Context/CartContext";
import Slider from "../Slider/Slider";

const API_URL = "https://shyamfoodbackend.onrender.com";

function AllOffersProducts({ filter, sortBy, price, cuisine }) {

    const navigate = useNavigate();
    const swiperRef = useRef(null);

    const { cartItems, addToCart, updateQty, getCartKey } = useCart();

    const { slug } = useParams();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ FETCH — products tagged with this offer's slug
    useEffect(() => {
        setLoading(true);
        axios
            .get(`${API_URL}/api/products?tag=${encodeURIComponent(slug)}`)
            .then((res) => {
                const products = res.data?.products || res.data?.data || [];
                setList(Array.isArray(products) ? products : []);
            })
            .catch((err) => {
                console.error("Fetch Offer Products Error:", err);
                setList([]);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const [openCardId, setOpenCardId] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});

    const filteredList = useMemo(() => {
        let result = [...list];

        // Veg / Non-Veg filter
        if (filter === "veg") {
            result = result.filter(item => item.type === "veg");
        }

        if (filter === "nonveg") {
            result = result.filter(item => item.type === "non-veg" || item.type === "nonveg");
        }

        // Price filter
        if (price) {
            const [min, max] = price.split("-").map(Number);
            result = result.filter(item =>
                max
                    ? item.price >= min && item.price <= max
                    : item.price >= min
            );
        }

        // Cuisine filter
        if (cuisine) {
            result = result.filter(item => item.cuisine === cuisine);
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
        return found ? found.quantity : ("ADD");
    };

    const increase = (item) => addToCart(item, 1);
    const decrease = (item) => {
        const key = getCartKey(item);
        const found = cartItems.find((x) => x.key === key);
        if (!found) return;
        updateQty(key, found.quantity - 1);
    };

    // ✅ item._id used consistently (was item.id — bug, Mongo docs don't have .id)
    const placeOrder = (item) =>
        navigate("/order#", {
            state: { item, category: "offers", slot: selectedSlots[item._id] },
        });

    const formatTitle = (text = "") =>
        text.replace(/-/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase());

    if (loading) {
        return (
            <>
                <Slider type={slug} />
                <div className="food-container">
                    <div className="food-text"><h1>{formatTitle(slug)}</h1></div>
                    <p className="p-6 text-center text-sm">Loading products...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Slider type={slug} />

            <div className="food-container">
                <div className="food-text">
                    <h1>{formatTitle(slug)}</h1>
                </div>

                {filteredList.length === 0 ? (
                    <p className="p-10 text-center text-sm text-gray-500">
                        No products tagged with "{slug}" yet.
                    </p>
                ) : (
                    <div className="food-card-grid">

                        {filteredList.map((item) => (
                            <div key={item._id} className="food-card">
                                {/* Slot popup */}
                                {openCardId === item._id && (
                                    <div className="slot-popup-overlay">
                                        <div className="slot-popup-content">
                                            <h4>Select a Slot</h4>
                                            <ul>
                                                {Array.isArray(item.slots) &&
                                                    item.slots.map((slot) => (
                                                        <li
                                                            key={slot}
                                                            className={
                                                                selectedSlots[item._id] === slot ? "selected" : ""
                                                            }
                                                            onClick={() =>
                                                                setSelectedSlots({
                                                                    ...selectedSlots,
                                                                    [item._id]: slot,
                                                                })
                                                            }
                                                        >
                                                            {slot}
                                                        </li>
                                                    ))}
                                            </ul>
                                            <button
                                                disabled={!selectedSlots[item._id]}
                                                onClick={() => {
                                                    setOpenCardId(null);
                                                    navigate("/order#", {
                                                        state: {
                                                            item,
                                                            category: "offers",
                                                            slot: selectedSlots[item._id],
                                                        },
                                                    });
                                                }}
                                            >
                                                Set Time & Place Order
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Image */}
                                <div className="food-image-wrapper">

                                    {/* ✅ Ads Badge */}
                                    {(item.video || item.video2) && (
                                        <div className="add-badge">Ads</div>
                                    )}

                                    {/* Video / Image Logic */}
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


                                {/* Info */}
                                <div className="food-info">
                                    <div className="food-status-left">
                                        <img src={item.isOpen ? Open : Close} alt="" />
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
                )}
            </div>
        </>
    )
}

export default AllOffersProducts