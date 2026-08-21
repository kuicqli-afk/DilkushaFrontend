import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./Slider.css";

const Slider1 = ({ category }) => {

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // ✅ FETCH ADS FROM API
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/ads?category=${category}`
        );

        setSlides(res.data.ads || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAds();
  }, [category]);

  // ✅ duplicate for infinite loop
  const loopSlides = [...slides, ...slides];

  // ✅ autoplay
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

  // ✅ smooth infinite loop
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

    return () =>
      track.removeEventListener("transitionend", handleTransitionEnd);

  }, [index, slides]);

  // ❌ no ads case
  if (slides.length === 0) return null;

  return (
    <div className="slider1-container">

      <div className="slider-track" ref={trackRef}>
        {loopSlides.map((item, i) => (
          <div className="slide" key={i}>

            <a href={item.link || "#"}>
              <img
                src={item.image}
                className="bg-img"
                alt="slide"
              />
            </a>

          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="slider-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${index % slides.length === i ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

    </div>
  );
};

export default Slider1;