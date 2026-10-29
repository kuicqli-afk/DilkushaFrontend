import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Food.css";
import Category from "../Category/Category";
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
import "../Slider/Slider.css"; // 🆕 same CSS jo main homepage slider use karta hai

import { useCart } from "../../Context/CartContext";
import { ProductGridSkeleton } from "../Skeleton/Skeleton";
import { optimizeImage } from "../../utils/image";
import { PressButton, ProductCard, RevealImage, SplitWords } from "../Motion/motionKit";


const API_URL = "https://dilkushabackend.onrender.com";

function AllOffersProducts({ filter, sortBy, price, cuisine }) {

    const navigate = useNavigate();
    const swiperRef = useRef(null);

    const { cartItems, addToCart, updateQty, getCartKey } = useCart();

    const { slug } = useParams();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🆕 Sirf isi offer ka banner data (title + image) — poora general slider nahi
    const [offerBanner, setOfferBanner] = useState(null);
    const [bannerLoading, setBannerLoading] = useState(true);

    // 🆕 FETCH — is offer ka apna single banner
    useEffect(() => {
        if (!slug) return;
        setBannerLoading(true);

        axios
            .get(`${API_URL}/api/offers/slug/${encodeURIComponent(slug)}`)
            .then((res) => {
                setOfferBanner(res.data?.data || null);
            })
            .catch((err) => {
                console.error("Fetch Offer Banner Error:", err);
                setOfferBanner(null);
            })
            .finally(() => setBannerLoading(false));
    }, [slug]);

    // ✅ FETCH — products tagged with this offer's slug
    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        // Debug what slug is captured from the URL route
        console.log("Fetching products for tag/slug:", slug);

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

    // 🆕 Offer banner image ka full URL banane ke liye
    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http://") || image.startsWith("https://")) return image;
        if (image.startsWith("/")) return `${API_URL}${image}`;
        return `${API_URL}/${image}`;
    };

    // 🆕 Same markup/classes jo DynamicSlider/Slider.jsx use karte hain — size bilkul match karega
    const OfferBanner = () =>
        !bannerLoading && offerBanner ? (
            <div className="slider-container">
                <div className="slider-track">
                    <div className="slide">
                        <img
                            src={optimizeImage(getImageUrl(offerBanner.image), 1600)}
                            className="bg-img"
                            alt={offerBanner.title || "Offer Banner"}
                        />
                    </div>
                </div>
            </div>
        ) : null;

    if (loading) {
        return (
            <>
                <OfferBanner />
                <div className="food-container">
                    {/* <div className="food-text"><h1>{offerBanner?.title || formatTitle(slug)}</h1></div> */}
                    <ProductGridSkeleton />
                </div>
            </>
        );
    }

    return (
        <>
            <OfferBanner />
            <Category />
            <div className="food-container">
                <div className="food-text">
                    {/* <h1>{offerBanner?.title || formatTitle(slug)}</h1> */}
                </div>

                {filteredList.length === 0 ? (
                    <p className="p-10 text-center text-sm text-gray-500">
                        No products tagged with "{slug}" yet.
                    </p>
                ) : (
                    <div className="food-card-grid">

                        {filteredList.map((item) => (
                            <ProductCard key={item._id} className="food-card">


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
                                        <RevealImage
                                            src={optimizeImage(item.image, 720)}
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

                                            <FaRegHeart size={20} title="Like" style={{ cursor: "pointer" }} />
                                            <img src={SaveIcon} alt="Save" title="Book Mark" />
                                            <img src={ShareIcon} alt="Share" title="Share" />
                                        </div>
                                    </div>

                                    <h2>
                                        <SplitWords text={item.title} /> <span>({item.portion})</span>
                                    </h2>
                                    <p className="food-desc"><SplitWords text={`${(item.desc || "").slice(0, 60)}...`} /></p>

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
                                        <PressButton className="order-btn" onClick={() => placeOrder(item)}>
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
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default AllOffersProducts;