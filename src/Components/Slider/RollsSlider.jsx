import React, { useEffect, useRef, useState } from "react";
import "./Slider.css";

import slide1 from "../../assets/banner4.png";
import slide2 from "../../assets/banner4.png";
import slide3 from "../../assets/banner4.png";
import offer from "../../assets/offer.png";

const slides = [slide1, slide2, slide3];
const loopSlides = [...slides, ...slides];
function RollsSlider() {
    const [index, setIndex] = useState(0);
    const trackRef = useRef(null);
    const isTransitioning = useRef(false);

    // autoplay
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isTransitioning.current) {
                isTransitioning.current = true;
                setIndex((prev) => prev + 1);
            }
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    // smooth infinite loop (NO RESTART FEEL)
    useEffect(() => {
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
    }, [index]);
    return (
        <div className="slider-container">
            <div className="slider-track" ref={trackRef}>
                {loopSlides.map((img, i) => (
                    <div className="slide" key={i}>
                        <img src={img} className="bg-img" alt="slide" />
                        {/* <img src={offer} className="offer-img" alt="offer" /> */}
                    </div>
                ))}
            </div>

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
    )
}

export default RollsSlider
