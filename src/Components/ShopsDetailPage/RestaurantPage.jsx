import React, { useEffect, useRef, useState } from "react";
import "../../Components/OrderPage/Section.css";

import hero1 from "../../assets/resto2.jpg";
import hero2 from "../../assets/resto2.jpg";
import hero3 from "../../assets/resto2.jpg";

import Popular from "../Popular/Popular";

import { AdsSlider } from "../AdsSlider/AdsSlider.jsx";
import LatestListing from "../Latest/LatestListing";

import { ScrollToTopButton } from "../ScrollToTopButton/ScrollToTopButton";
import Footer from "../Footer/Footer";

import FeaturedListigsFinal from "../FeaturedListings/FeaturedListigsFinal";

const heroSlides = [hero1, hero2, hero3];
const loopHeroSlides = [...heroSlides, ...heroSlides];

const CombinedComponent = () => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const isTransitioning = useRef(false);

  // Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning.current) {
        isTransitioning.current = true;
        setIndex((prev) => prev + 1);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Infinite smooth loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = "transform 0.8s ease-in-out";
    track.style.transform = `translateX(-${index * 100}%)`;

    const handleTransitionEnd = () => {
      if (index >= heroSlides.length) {
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
    <>
      {/* ===== HERO SLIDER ===== */}
      <section className="hero-slider">
        <div className="hero-track" ref={trackRef}>
          {loopHeroSlides.map((img, i) => (
            <div className="hero-slide" key={i}>
              <img src={img} alt="hero" />
              <div className="hero-overlay-content">
                <h2>Let’s Explore</h2>
                <h1>
                  LUCKNOW AMAZING LOCAL Restaurants & EXPLORE OFFERS &
                  DISCOUNTS
                </h1>
                <p>
                  Find amazing RESTAURANTS in Lucknow! Discover great places
                  for dining, enjoy special offers and discounts.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Popular />
      {/* <MarketSlider /> */}
      {/* <FeaturedListings />
      <FeaturedListingsAll/> */}
      <FeaturedListigsFinal/>
      <AdsSlider />
      <LatestListing />
      {/* <SellerStories /> */}
      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default CombinedComponent;
