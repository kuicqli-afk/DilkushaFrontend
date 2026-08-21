// Slider.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const Slider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // =====================================================
  // FETCH SLIDERS
  // =====================================================

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sliders`);

        console.log("Slider API Response:", res.data);

        const sliderData =
          res.data?.data ||
          res.data?.sliders ||
          [];

        const activeSliders = sliderData
          .filter((slider) => {
            return (
              slider.status === "Active" ||
              slider.status === "active"
            );
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

        setSlides(activeSliders);
      } catch (error) {
        console.error("Fetch Slider Error:", error);
        setSlides([]);
      }
    };

    fetchSliders();
  }, []);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) return "";

    // Cloudinary / external URL
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Local backend image
    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };

  // =====================================================
  // HANDLE SLIDER CLICK
  // =====================================================

  const handleClick = (item) => {
    if (!item) return;

    // If buttonLink exists
    if (item.buttonLink) {
      const link = item.buttonLink.trim();

      // Internal React route
      if (link.startsWith("/")) {
        navigate(link);
        return;
      }

      // External URL
      if (
        link.startsWith("http://") ||
        link.startsWith("https://")
      ) {
        window.open(link, "_blank", "noopener,noreferrer");
        return;
      }
    }
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
  // LOADING
  // =====================================================

  if (slides.length === 0) {
    return (
      <div className="slider-container">
        Loading banners...
      </div>
    );
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
            onClick={() => handleClick(slide)}
          >

            <img
              src={getImageUrl(slide.image)}
              className="bg-img"
              alt={
                slide.title ||
                "Promotional Slider"
              }
            />

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