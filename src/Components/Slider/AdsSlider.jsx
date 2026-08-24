// Slider1.jsx — category wise slider (admin se selected category ka)
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "https://shyamfoodbackend.onrender.com";

const Slider1 = ({ category }) => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ USI CATEGORY KE SLIDERS — admin wahi naam select karega
  const fetchSliders = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/sliders?category=${encodeURIComponent(category)}&status=Active`
      );

      const list = res.data?.data || res.data?.sliders || [];
      const active = list.filter(
        (s) => s.status === "Active" || s.status === "active"
      );

      setSlides(active);
      setIndex(0);
    } catch (err) {
      console.log("Fetch Category Slider Error:", err);
    }
  };

  // ✅ Category change par + har 30s refetch
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

  // ✅ Button link ho toh click, warna kuch nahi
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

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setIndex((prev) => prev + 1);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= slides.length) {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIndex(0);
      }
      isTransitioning.current = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, slides]);

  // ✅ Koi slider nahi → section poora hide (khaali space nahi)
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
            <img
              src={getImageUrl(item.image)}
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

export default Slider1;