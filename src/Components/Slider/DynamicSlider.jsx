// DynamicSlider.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "https://shyamfoodbackend.onrender.com";

const DynamicSlider = () => {
  const navigate = useNavigate();

  const [banner, setBanner] = useState(null);
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ FETCH — Active only + 30s refetch
  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sliders?status=Active`);

      const banners = res.data?.sliders || res.data?.data || [];

      const activeBanners = (Array.isArray(banners) ? banners : [])
        .filter((b) => (b.status === "Active" || b.status === "active") && !b.category)
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

      if (activeBanners.length === 0) {
        setBanner(null);
        setSlides([]);
        return;
      }

      const latest = activeBanners[0];
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
          buttonLink: latest.buttonLink || "",
        }));

      setSlides(slidesData);
      setIndex(0);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanner(null);
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
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/")) return `${API_URL}${image}`;
    return `${API_URL}/${image}`;
  };

  // ✅ SIRF BUTTON se navigate
  const handleButtonClick = (item) => {
    if (!item?.buttonLink) return;
    const link = item.buttonLink.trim();
    if (!link) return;

    if (link.startsWith("/")) { navigate(link); return; }
    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_self", "noopener,noreferrer");
      return;
    }
    window.open(link, "_self");
  };

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
  }, [index, slides.length]);

  const handleDotClick = (dotIndex) => {
    const track = trackRef.current;
    if (!track || slides.length === 0 || isTransitioning.current) return;
    isTransitioning.current = true;
    track.style.transition = "transform 0.8s ease-in-out";
    setIndex(dotIndex);
  };

  if (loading) {
    return <div className="slider-container">Loading banner...</div>;
  }

  if (!banner || slides.length === 0) return null;

  const loopSlides = slides.length > 1 ? [...slides, ...slides] : slides;

  return (
    <div className="slider-container">
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((slide, i) => (
          <div
            key={`${slide.src}-${i}`}
            className="slide"
            style={{ position: "relative" }}
          >
            <img
              src={getImageUrl(slide.src)}
              className="bg-img"
              alt={slide.title || "Promotional Banner"}
              loading={i === 0 ? "eager" : "lazy"}
            />

            {slide.buttonLink && (
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
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                  whiteSpace: "nowrap",
                  zIndex: 2,
                }}
              >
                View
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
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicSlider;