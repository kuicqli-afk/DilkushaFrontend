import React from "react";
import "./Section.css";
import sectionImage from "../../assets/section.jpg";

const Section = () => {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div> {/* Dark overlay */}
      <div className="hero-content">
        <h2>Let’s Explore</h2>
        <h1>LUCKNOW AMAZING LOCAL SHOPS & EXPLORE OFFERS & DISCOUNTS</h1>
        <p>Find great places for fashion, electronics, jewellery, restaurant, furniture or visit local shops near by you & find what discounts & offers going on and get the benefits.</p>
      </div>
      <img src={sectionImage} alt="Market" className="hero-image" />
    </section>
  );
};

export default Section;
