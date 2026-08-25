// DynamicSlider.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "https://shyamfoodbackend.onrender.com";

const DynamicSlider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ FETCH — SAARE ACTIVE + GENERAL sliders + har 30s refetch
  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sliders?status=Active`);

      const banners = res.data?.sliders || res.data?.data || [];

      // Sabhi active general sliders — har ek = ek slide
      const activeBanners = (Array.isArray(banners) ? banners : [])
        .filter(
          (b) =>
            (b.status === "Active" || b.status === "active") &&
            !b.category
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

      const slidesData = activeBanners
        .map((b) => ({
          src: b.image,
          title: b.title || "Promotional Banner",
          buttonLink: b.buttonLink || "",
        }))
        .filter((s) => s.src);

      console.log("DynamicSlider → total slides:", slidesData.length);

      setSlides(slidesData);
      setIndex(0);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    const interval = setInterval(fetchBanners, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // ✅ KAHI BHI CLICK → navigate
  const handleSlideClick = (item) => {
    if (!item?.buttonLink) return;
    const link = item.buttonLink.trim();
    if (!link || link === "#") return;

    if (link.startsWith("/")) {
      navigate(link);
      return;
    }
    if (
      link.startsWith("http://") ||
      link.startsWith("https://")
    ) {
      window.open(link, "_self", "noopener,noreferrer");
      return;
    }
    window.open(link, "_self");
  };

  const loopSlides = [...slides, ...slides];

  // ✅ AUTOPLAY — har 3 second
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

  // ✅ SMOOTH INFINITE LOOP
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

  if (loading) {
    return <div className="slider-container">Loading banner...</div>;
  }

  if (slides.length === 0) return null;

  return (
    <div className="slider-container">
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((slide, i) => (
          <div
            className="slide"
            key={`${slide.src}-${i}`}
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => handleSlideClick(slide)}
          >
            <img
              src={getImageUrl(slide.src)}
              className="bg-img"
              alt={slide.title || "Promotional Banner"}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* ✅ DOTS — 2+ slides par dikhenge */}
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

export default DynamicSlider;