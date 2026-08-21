// Slider2.jsx

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";

const API_URL = "https://shyamfoodbackend.onrender.com";

const Slider2 = () => {
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
        const res = await axios.get(
          `${API_URL}/api/sliders`
        );

        console.log("Slider2 API Response:", res.data);

        const sliderData =
          res.data?.data ||
          res.data?.sliders ||
          [];

        // Only Active sliders
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

        // Convert backend data to slider format
        const formattedSlides = activeSliders.map(
          (slider) => ({
            src: slider.image,
            title: slider.title,
          })
        );

        setSlides(formattedSlides);
      } catch (error) {
        console.error(
          "Slider2 Fetch Error:",
          error
        );

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

    // External image
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // Local image starting with /
    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    // Local image
    return `${API_URL}/${image}`;
  };

  // =====================================================
  // DUPLICATE SLIDES FOR INFINITE LOOP
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
    if (isTransitioning.current) return;

    setIndex(dotIndex);
  };

  // =====================================================
  // NO SLIDERS
  // =====================================================

  if (!slides.length) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="slider1-container">

      {/* SLIDER TRACK */}

      <div
        className="slider-track"
        ref={trackRef}
      >
        {loopSlides.map((slide, i) => (
          <div
            className="slide"
            key={`${slide.title || "slide"}-${i}`}
          >
            <img
              src={getImageUrl(slide.src)}
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

export default Slider2;