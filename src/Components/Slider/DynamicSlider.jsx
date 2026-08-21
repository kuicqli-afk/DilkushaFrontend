
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const DynamicSlider = () => {
  const navigate = useNavigate();

  const [banner, setBanner] = useState(null);
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // =====================================================
  // FETCH LATEST BANNER
  // =====================================================

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sliders`);

        console.log("Banner API Response:", res.data);

        const banners =
          res.data?.sliders ||
          res.data?.data ||
          [];

        if (!Array.isArray(banners) || banners.length === 0) {
          setBanner(null);
          setSlides([]);
          return;
        }

        const sortedBanners = [...banners].sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

        const latest = sortedBanners[0];

        setBanner(latest);

        const images = Array.isArray(latest.images)
          ? latest.images
          : latest.image
            ? [latest.image]
            : [];

        const slidesData = images
          .filter(Boolean)
          .map((img) => ({
            src: img,
            title: latest.title || "Promotional Banner",
            off: latest.off || "",
            type: latest.type || "",
            buttonLink: latest.buttonLink || "",
          }));

        setSlides(slidesData);
        setIndex(0);
      } catch (error) {
        console.error("Error fetching banners:", error);

        setBanner(null);
        setSlides([]);
      }
    };

    fetchBanners();
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
  }, [slides.length]);

  // =====================================================
  // SMOOTH INFINITE LOOP
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
  }, [index, slides.length]);

  // =====================================================
  // HANDLE CLICK
  // =====================================================

  const handleClick = (item) => {
    if (!item) return;

    // Button link has priority
    if (item.buttonLink) {
      const link = item.buttonLink.trim();

      if (link.startsWith("/")) {
        navigate(link);
        return;
      }

      if (
        link.startsWith("http://") ||
        link.startsWith("https://")
      ) {
        window.open(
          link,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }
    }

    const type = item.type?.toLowerCase();

    switch (type) {
      case "flat":
        return;

      case "combo":
        navigate("/all-combos");
        return;

      case "weekend":
        navigate("/weekend-specials");
        return;

      case "offer":
        navigate(
          `/discount?tag=offer&discount=${encodeURIComponent(
            item.off || ""
          )}`
        );
        return;

      default:
        return;
    }
  };

  // =====================================================
  // DOT CLICK
  // =====================================================

  const handleDotClick = (dotIndex) => {
    const track = trackRef.current;

    if (!track || slides.length === 0) return;

    if (isTransitioning.current) return;

    isTransitioning.current = true;

    track.style.transition =
      "transform 0.8s ease-in-out";

    setIndex(dotIndex);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!banner) {
    return (
      <div className="slider-container">
        Loading banner...
      </div>
    );
  }

  // =====================================================
  // NO SLIDES
  // =====================================================

  if (slides.length === 0) {
    return null;
  }

  // =====================================================
  // DUPLICATE SLIDES
  // =====================================================

  const loopSlides =
    slides.length > 1
      ? [...slides, ...slides]
      : slides;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="slider-container">

      <div
        className="slider-track"
        ref={trackRef}
      >
        {loopSlides.map((slide, i) => (
          <div
            key={`${slide.src}-${i}`}
            className="slide"
            onClick={() => handleClick(slide)}
          >
            <img
              src={getImageUrl(slide.src)}
              className="bg-img"
              alt={
                slide.title ||
                "Promotional Banner"
              }
              loading={
                i === 0 ? "eager" : "lazy"
              }
            />
          </div>
        ))}
      </div>

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

export default DynamicSlider;

