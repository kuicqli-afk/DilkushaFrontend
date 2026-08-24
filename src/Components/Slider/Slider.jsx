// Slider.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "https://shyamfoodbackend.onrender.com";

const Slider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // =====================================================
  // FETCH SLIDERS — ✅ sirf ACTIVE + auto refetch 30s
  // =====================================================

  const fetchSliders = async () => {
    try {
      // ✅ ?status=Active → backend se hi sirf Active aate hain
      const res = await axios.get(`${API_URL}/api/sliders?status=Active`);

      const sliderData = res.data?.data || res.data?.sliders || [];

      // double safety: client side bhi filter
      const activeSliders = sliderData
        .filter(
          (slider) =>
            slider.status === "Active" ||
            slider.status === "active"
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

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

    // ✅ Har 30 second refetch → Activate/Deactivate turant reflect
    const interval = setInterval(fetchSliders, 30000);
    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // ✅ SIRF BUTTON CLICK — image click par kuch nahi hota
  // =====================================================

  const handleButtonClick = (item) => {
    if (!item || !item.buttonLink) return;

    const link = item.buttonLink.trim();
    if (!link) return;

    // Internal route → same site, same page (new tab nahi)
    if (link.startsWith("/")) {
      navigate(link);
      return;
    }

    // External URL → same tab mein khule
    if (
      link.startsWith("http://") ||
      link.startsWith("https://")
    ) {
      window.open(link, "_self", "noopener,noreferrer");
      return;
    }

    // tel: / whatsapp: type links
    window.open(link, "_self");
  };

  // =====================================================
  // DUPLICATE SLIDES FOR LOOP
  // =====================================================

  const loopSlides =
    slides.length > 0
      ? [...slides, ...slides]
      : [];

  // =====================================================
  // AUTOPLAY
  // =====================================================

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

  // =====================================================
  // SMOOTH LOOP
  // =====================================================

  useEffect(() => {
    const track = trackRef.current;

    if (!track || slides.length === 0) return;

    track.style.transition =
      "transform 0.8s ease-in-out";

    track.style.transform =
      `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= slides.length) {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIndex(0);
      }
      isTransitioning.current = false;
    };

    track.addEventListener(
      "transitionend",
      handleTransitionEnd
    );

    return () => {
      track.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
    };
  }, [index, slides]);

  // =====================================================
  // DOT CLICK
  // =====================================================

  const handleDotClick = (dotIndex) => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition =
      "transform 0.8s ease-in-out";
    setIndex(dotIndex);
  };

  // =====================================================
  // LOADING / EMPTY
  // =====================================================

  if (loading) {
    return (
      <div className="slider-container">
        Loading banners...
      </div>
    );
  }

  // ✅ Koi Active slider nahi → slider section poora hide
  if (slides.length === 0) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="slider-container">

      {/* SLIDER TRACK */}

      <div
        className="slider-track"
        ref={trackRef}
      >
        {loopSlides.map((slide, i) => (
          <div
            key={`${slide._id || "slide"}-${i}`}
            className="slide"
            style={{ position: "relative" }}
          >

            <img
              src={getImageUrl(slide.image)}
              className="bg-img"
              alt={
                slide.title ||
                "Promotional Slider"
              }
            />

            {/* ✅ BUTTON — sirf yeh clickable hai, image nahi */}
            {slide.buttonText && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleButtonClick(slide);
                }}
                style={{
                  position: "absolute",
                  bottom: "28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "11px 28px",
                  borderRadius: "30px",
                  border: "none",
                  background: "#f97316",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.4px",
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  whiteSpace: "nowrap",
                  zIndex: 2,
                }}
              >
                {slide.buttonText}
              </button>
            )}

          </div>
        ))}
      </div>

      {/* DOTS */}

      {slides.length > 1 && (
        <div className="slider-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`dot ${index % slides.length === i
                ? "active"
                : ""
                }`}
              onClick={() =>
                handleDotClick(i)
              }
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default Slider;