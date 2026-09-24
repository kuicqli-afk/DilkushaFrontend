// DynamicSlider.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";

const API_URL = "https://backend.shyamnamkeenandbakers.online";

const DynamicSlider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);
  const isHovered = useRef(false);
  // ✅ FETCH — General Sliders + Offers, dono ko merge karke ek array banao
  const fetchBanners = async () => {
    try {
      // Dono APIs ek saath call — koi ek fail ho to bhi dusra chal jaye
      const [sliderRes, offerRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/sliders?status=Active`),
        axios.get(`${API_URL}/api/offers?status=Active`),
      ]);

      // ---------- SLIDER DATA ----------
      let sliderSlides = [];
      if (sliderRes.status === "fulfilled") {
        const banners = sliderRes.value.data?.sliders || sliderRes.value.data?.data || [];

        // const activeBanners = (Array.isArray(banners) ? banners : [])
        //   .filter((b) => (b.status === "Active" || b.status === "active") && !b.category)
        //   .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const activeBanners = (Array.isArray(banners) ? banners : [])
          .filter((b) => (b.status === "Active" || b.status === "active") && !b.category)
          // ✅ sortOrder se arrange hoga (drag-drop wala order),
          //    same sortOrder par naya slider pehle
          .sort(
            (a, b) =>
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );

        sliderSlides = activeBanners
          .map((b) => ({
            src: b.image,
            title: b.title || "Promotional Banner",
            buttonLink: b.buttonLink || "",
            source: "slider",
          }))
          .filter((s) => s.src);
      } else {
        console.error("Slider fetch failed:", sliderRes.reason);
      }

      // ---------- OFFER DATA ----------
      let offerSlides = [];
      if (offerRes.status === "fulfilled") {
        const offers = offerRes.value.data?.offers || offerRes.value.data?.data || [];

        offerSlides = (Array.isArray(offers) ? offers : [])
          .filter((o) => o.status === "Active" || o.status === "active")
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((o) => ({
            src: o.image,
            title: o.title || "Offer",
            buttonLink: `/offers/${o.slug}`, // offer pe click → uska products page
            source: "offer",
          }))
          .filter((s) => s.src);
      } else {
        console.error("Offer fetch failed:", offerRes.reason);
      }

      // ---------- MERGE (jaise aaye waise hi rakho, koi extra reorder nahi) ----------
      const merged = [...sliderSlides, ...offerSlides];

      console.log("DynamicSlider → sliders:", sliderSlides.length, "| offers:", offerSlides.length, "| total:", merged.length);

      setSlides(merged);
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
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }
    return `${API_URL}/${image}`;
  };

  // ✅ KAHI BHI CLICK → navigate (slider ke buttonLink aur offer ke /offers/:slug dono ke liye same logic)
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
      return;
    }
    window.open(link, "_self");
  };

  const loopSlides = [...slides, ...slides];

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      if (!isTransitioning.current && !isHovered.current) {
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
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} className="slider-container">Loading Sliders...</div>;
  }

  if (slides.length === 0) return null;

  return (
    <div className="slider-container"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
    >
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