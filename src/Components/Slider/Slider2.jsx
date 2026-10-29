// Slider2.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";

const API_URL = "https://dilkushabackend.onrender.com";

const Slider2 = () => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ FETCH — Active only + 30s refetch
  const fetchSliders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/sliders?status=Active`);
      const sliderData = res.data?.data || res.data?.sliders || [];

      const activeSliders = sliderData
        .filter((s) => (s.status === "Active" || s.status === "active") && !s.category)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const formattedSlides = activeSliders.map((slider) => ({
        src: slider.image,
        title: slider.title,
      }));

      setSlides(formattedSlides);
    } catch (error) {
      console.error("Slider2 Fetch Error:", error);
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

  const loopSlides = slides.length > 0 ? [...slides, ...slides] : [];

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
    if (isTransitioning.current) return;
    setIndex(dotIndex);
  };

  if (loading) return null;
  if (!slides.length) return null;

  return (
    <div className="slider1-container">
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((slide, i) => (
          <div className="slide" key={`${slide.title || "slide"}-${i}`}>
            <img
              src={getImageUrl(slide.src)}
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

export default Slider2;