import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";
import { useNavigate } from "react-router-dom";
import { optimizeImage } from "../../utils/image";
import { RevealImage } from "../Motion/motionKit";

const API_URL = "https://dilkushabackend.onrender.com";
const AUTOPLAY_MS = 3000;
const REFRESH_MS = 30000;
const SWIPE_MIN_PX = 40;

const isActive = (item) => item.status === "Active" || item.status === "active";

const getImageUrl = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) return `${API_URL}${image}`;
  return `${API_URL}/${image}`;
};

const DynamicSlider = () => {
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef(null);
  const isTransitioning = useRef(false);
  const isPaused = useRef(false); // hover (desktop) or finger down (touch)
  const slidesKey = useRef("");
  const touchStart = useRef(null);
  const justSwiped = useRef(false);

  /* ---------- FETCH: sliders + offers merged into one list ---------- */
  const fetchBanners = useCallback(async () => {
    try {
      // Both calls run together; if one fails the other still works
      const [sliderRes, offerRes] = await Promise.allSettled([
        axios.get(`${API_URL}/api/sliders?status=Active`),
        axios.get(`${API_URL}/api/offers?status=Active`),
      ]);

      let sliderSlides = [];
      if (sliderRes.status === "fulfilled") {
        const banners = sliderRes.value.data?.sliders || sliderRes.value.data?.data || [];

        sliderSlides = (Array.isArray(banners) ? banners : [])
          .filter((b) => isActive(b) && !b.category)
          // sortOrder first (drag-drop order); newer slider first when equal
          .sort(
            (a, b) =>
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
              new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
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

      let offerSlides = [];
      if (offerRes.status === "fulfilled") {
        const offers = offerRes.value.data?.offers || offerRes.value.data?.data || [];

        offerSlides = (Array.isArray(offers) ? offers : [])
          .filter(isActive)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((o) => ({
            src: o.image,
            title: o.title || "Offer",
            buttonLink: `/offers/${o.slug}`, // click -> that offer's products page
            source: "offer",
          }))
          .filter((s) => s.src);
      } else {
        console.error("Offer fetch failed:", offerRes.reason);
      }

      const merged = [...sliderSlides, ...offerSlides];

      // Only touch state when the banners really changed.
      // (Before, every 30s refresh threw the visitor back to slide 1.)
      const key = JSON.stringify(merged.map((s) => [s.src, s.buttonLink, s.title]));
      if (key !== slidesKey.current) {
        slidesKey.current = key;
        setSlides(merged);
        setIndex(0);
        isTransitioning.current = false;
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    const interval = setInterval(fetchBanners, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchBanners]);

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

  /* ---------- CLICK ---------- */
  const handleSlideClick = (item) => {
    if (justSwiped.current) return;
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
      justSwiped.current = true;
      setTimeout(() => {
        justSwiped.current = false;
      }, 350);
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  /* ---------- RENDER ---------- */
  if (loading) {
    return <div className="slider-container slider-skeleton" aria-hidden="true" />;
  }

  if (total === 0) return null;

  return (
    <div
      className="slider-container"
      role="region"
      aria-roledescription="carousel"
      aria-label="Offers and banners"
      onMouseEnter={() => (isPaused.current = true)}
      onMouseLeave={() => (isPaused.current = false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((slide, i) => {
          const clickable = Boolean(slide.buttonLink && slide.buttonLink.trim() && slide.buttonLink.trim() !== "#");
          return (
            <div
              className="slide"
              key={`${slide.src}-${i}`}
              style={{ position: "relative", cursor: clickable ? "pointer" : "default" }}
              onClick={() => handleSlideClick(slide)}
              {...(clickable
                ? {
                  role: "link",
                  tabIndex: i < total ? 0 : -1,
                  onKeyDown: (e) => {
                    if (e.key === "Enter") handleSlideClick(slide);
                  },
                }
                : {})}
            >
              <RevealImage
                src={optimizeImage(getImageUrl(slide.src), 1600)}
                // phones get a 640px or 1024px copy instead of the 1600px one
                srcSet={[640, 1024, 1600].map((w) => `${optimizeImage(getImageUrl(slide.src), w)} ${w}w`).join(", ")}
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="bg-img"
                alt={slide.title || "Promotional Banner"}
                loading={i === 0 ? "eager" : "lazy"}
                priority={i === 0}
                decoding="async"
                draggable={false}
              />
            </div>
          );
        })}
      </div>

      {/* DOTS — shown when there are 2+ slides */}
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

export default DynamicSlider;