import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";
import { optimizeImage } from "../../utils/image";
import { RevealImage } from "../Motion/motionKit";

const API_URL = "https://dilkushabackend.onrender.com";

const ViewAllSlider = ({ category }) => {
    const navigate = useNavigate();

    const [slides, setSlides] = useState([]);
    const [index, setIndex] = useState(0);

    const trackRef = useRef(null);

    const fetchSliders = async () => {
        try {
            const res = await axios.get(
                `${API_URL}/api/sliders?category=${encodeURIComponent(category)}&status=Active`
            );

            const list = res.data?.data || res.data?.sliders || [];
            const active = list.filter((s) => {
                const isActive = s.status === "Active" || s.status === "active";
                // Only exclude if explicitly set for Home Middle Ads AND NOT for View All
                const isExclusiveHomeAd = (s.showOnHome === true || s.showOnHome === "true") && (s.showOnViewAll !== true && s.showOnViewAll !== "true");
                return isActive && !isExclusiveHomeAd;
            });

            setSlides(active);
        } catch (err) {
            console.log("Fetch Category Slider Error:", err);
        }
    };

    useEffect(() => {
        if (!category) {
            setSlides([]);
            return;
        }
        fetchSliders();
        const interval = setInterval(fetchSliders, 30000);
        return () => clearInterval(interval);
    }, [category]);

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http://") || image.startsWith("https://")) return image;
        if (image.startsWith("/")) return `${API_URL}${image}`;
        return `${API_URL}/${image}`;
    };

    const handleSlideClick = (item) => {
        if (!item?.buttonLink) return;
        const link = item.buttonLink.trim();
        if (!link || link === "#") return;

        if (link.startsWith("/")) {
            navigate(link);
            return;
        }
        if (link.startsWith("http://") || link.startsWith("https://")) {
            window.open(link, "_self", "noopener,noreferrer");
        }
    };

    const loopSlides = [...slides, ...slides];

    // Continuous auto-slide timer that never stops
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 3000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Handle seamless transition without getting stuck if tab loses focus
    useEffect(() => {
        if (slides.length === 0) return;
        const track = trackRef.current;
        if (!track) return;

        if (index >= slides.length) {
            track.style.transition = "transform 0.8s ease-in-out";
            track.style.transform = `translateX(-${index * 100}%)`;

            const timeout = setTimeout(() => {
                track.style.transition = "none";
                track.style.transform = "translateX(0)";
                setIndex(0);
            }, 800);

            return () => clearTimeout(timeout);
        } else {
            track.style.transition = "transform 0.8s ease-in-out";
            track.style.transform = `translateX(-${index * 100}%)`;
        }
    }, [index, slides.length]);

    if (slides.length === 0) return null;

    return (
        <div className="slider1-container">
            <div className="slider-track" ref={trackRef}>
                {loopSlides.map((item, i) => (
                    <div
                        className="slide"
                        key={item._id ? `${item._id}-${i}` : i}
                        style={{ position: "relative" }}
                    >
                        <RevealImage
                            src={optimizeImage(getImageUrl(item.image), 1600)}
                            className="bg-img"
                            alt={item.title || "Category Slider"}
                        />

                        {item.buttonText && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSlideClick(item);
                                }}
                                style={{
                                    position: "absolute",
                                    bottom: "24px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    padding: "9px 22px",
                                    borderRadius: "30px",
                                    border: "none",
                                    background: "#f97316",
                                    color: "#fff",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                    whiteSpace: "nowrap",
                                    zIndex: 2,
                                }}
                            >
                                {item.buttonText}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {slides.length > 1 && (
                <div className="slider-dots">
                    {slides.map((_, i) => (
                        <span
                            key={i}
                            className={`dot ${index % slides.length === i ? "active" : ""}`}
                            onClick={() => setIndex(i)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewAllSlider;