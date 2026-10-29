// Slider.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";
import { optimizeImage } from "../../utils/image";

const API_URL = "https://dilkushabackend.onrender.com";

const Slider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ FETCH — sirf ACTIVE + GENERAL (bina category ke) + har 30s refetch
  const fetchSliders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sliders?status=Active`);
      const sliderData = res.data?.data || res.data?.sliders || [];

      const activeSliders = sliderData
        .filter((s) => (s.status === "Active" || s.status === "active") && !s.category)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setSlides(activeSliders);
    } catch (error) {
      console.error("Fetch Slider Error:", error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
    const interval = setInterval(fetchSliders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `${API_URL}${image}`;
    return `${API_URL}/${image}`;
  };

  // ✅ POORA SLIDER CLICKABLE — kahin bhi click → buttonLink par
  const handleSlideClick = (item) => {
    if (!item?.buttonLink) return;
    const link = item.buttonLink.trim();
    if (!link || link === "#") return;

    // Internal route → same site, new tab nahi
    if (link.startsWith("/")) {
      navigate(link);
      return;
    }

    // External URL → same tab
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_self", "noopener,noreferrer");
      return;
    }

    window.open(link, "_self");
  };

  const loopSlides = slides.length > 0 ? [...slides, ...slides] : [];

  // ✅ AUTOPLAY
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setIndex((prev) => prev + 1);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [slides]);

  // ✅ SMOOTH LOOP
  useEffect(() => {
    const track = trackRef.current;
    if (!track || slides.length === 0) return;

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

  const handleDotClick = (dotIndex) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = "transform 0.8s ease-in-out";
    setIndex(dotIndex);
  };

  if (loading) {
    return <div className="slider-container slider-skeleton" aria-hidden="true" />;
  }

  if (slides.length === 0) return null; // koi general active slider nahi → hide

  return (
    <div className="slider-container">
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((slide, i) => (
          <div
            key={`${slide._id || "slide"}-${i}`}
            className="slide"
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => handleSlideClick(slide)}
          >
            <img
              src={optimizeImage(getImageUrl(slide.image), 1600)}
              className="bg-img"
              alt={slide.title || "Promotional Slider"}
            />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="slider-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`dot ${index % slides.length === i ? "active" : ""}`}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;