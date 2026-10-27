import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";
import { optimizeImage } from "../../utils/image";
import { RevealImage } from "../Motion/motionKit";

const API_URL = "http://localhost:5001";
const AUTOPLAY_MS = 3000;
const REFRESH_MS = 30000;
const SWIPE_MIN_PX = 40;

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return `${API_URL}${image}`;
  return `${API_URL}/${image}`;
};

const AdsSlider = ({ category }) => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);
  const isPaused = useRef(false); // finger on the slider
  const slidesKey = useRef("");
  const touchStart = useRef(null);

  /* ---------- FETCH: this category's sliders that have "Show on Home" ticked ---------- */
  useEffect(() => {
    // new category (or none) -> clear the old banners straight away
    slidesKey.current = "";
    isTransitioning.current = false;
    setSlides([]);
    setIndex(0);

    if (!category) return undefined;

    let cancelled = false;

    const fetchSliders = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/sliders?category=${encodeURIComponent(category)}&status=Active&showOnHome=true`
        );
        if (cancelled) return; // answer for a category we already left

        const list = res.data?.data || res.data?.sliders || [];
        const active = (Array.isArray(list) ? list : []).filter(
          (s) =>
            (s.status === "Active" || s.status === "active") &&
            (s.showOnHome === true || s.showOnHome === "true")
        );

        // Only touch state when the banners really changed.
        // (Before, every 30s refresh sent the visitor back to slide 1.)
        const key = JSON.stringify(active.map((s) => [s._id, s.image, s.title, s.buttonText, s.buttonLink]));
        if (key !== slidesKey.current) {
          slidesKey.current = key;
          setSlides(active);
          setIndex(0);
          isTransitioning.current = false;
        }
      } catch (err) {
        if (!cancelled) console.log("Fetch Category Slider Error:", err);
      }
    };

    fetchSliders();
    const interval = setInterval(fetchSliders, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [category]);

  /* ---------- NAVIGATION ---------- */
  const total = slides.length;
  const canSlide = total > 1;
  // a single banner needs no duplicate for the infinite loop
  const loopSlides = canSlide ? [...slides, ...slides] : slides;

  const goNext = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    if (index === 0) {
      // jump (invisibly) to the duplicate set, then slide back one
      const track = trackRef.current;
      if (track) {
        track.style.transition = "none";
        track.style.transform = `translateX(-${total * 100}%)`;
        void track.offsetWidth; // force reflow so the jump is applied first
      }
      setIndex(total - 1);
    } else {
      setIndex(index - 1);
    }
  }, [index, total]);

  /* ---------- AUTOPLAY ---------- */
  useEffect(() => {
    if (!canSlide) return undefined;
    const timer = setInterval(() => {
      if (!isPaused.current && !document.hidden) goNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [canSlide, goNext]);

  /* ---------- MOVE THE TRACK + SEAMLESS LOOP ---------- */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || total === 0) return undefined;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = (e) => {
      if (e.target !== track) return;
      if (index >= total) {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        setIndex(0);
      }
      isTransitioning.current = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd);
    // safety net: never let autoplay get stuck if a transitionend is missed
    const safety = setTimeout(() => {
      isTransitioning.current = false;
    }, 1200);

    return () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      clearTimeout(safety);
    };
  }, [index, total]);

  /* ---------- BUTTON CLICK (same rules as before) ---------- */
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

  /* ---------- TOUCH SWIPE ---------- */
  const handleTouchStart = (e) => {
    isPaused.current = true;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current = null;
    // keep autoplay paused briefly so it doesn't jump right after a swipe
    setTimeout(() => {
      isPaused.current = false;
    }, 1500);

    if (!start || !canSlide) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  // No sliders -> hide the whole section (no empty gap)
  if (total === 0) return null;

  return (
    <div
      className="slider1-container"
      role="region"
      aria-roledescription="carousel"
      aria-label="Category banners"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((item, i) => (
          <div className="slide" key={item._id ? `${item._id}-${i}` : i} style={{ position: "relative" }}>
            <RevealImage
              src={optimizeImage(getImageUrl(item.image), 1600)}
              className="bg-img"
              alt={item.title || "Category Slider"}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />

            {item.buttonText && (
              <button
                type="button"
                className="slide-cta"
                tabIndex={i < total ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlideClick(item);
                }}
              >
                {item.buttonText}
              </button>
            )}
          </div>
        ))}
      </div>

      {canSlide && (
        <div className="slider-dots">
          {slides.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`dot ${index % total === i ? "active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={index % total === i ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsSlider;