import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./WhatTheySay.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Importing react-icons

import listinglogo from "../../assets/listinglogo.jpg";

const testimonials = [
  {
    name: "Shop Owner",
    role: "Founder",
    text: "I was impressed by the moling services, not lorem ipsum is simply free text of used by refreshing. Neque porro este qui dolorem ipsum quia.",
    image: listinglogo,
  },
  {
    name: "User",
    role: "Customer",
    text: "I was impressed by the moling services, not lorem ipsum is simply free text of used by refreshing. Neque porro este qui dolorem ipsum quia.",
    image: listinglogo,
  },
  {
    name: "Shop Owner",
    role: "Founder",
    text: "I was impressed by the moling services, not lorem ipsum is simply free text of used by refreshing. Neque porro este qui dolorem ipsum quia.",
    image: listinglogo,
  },
  {
    name: "User",
    role: "Customer",
    text: "I was impressed by the moling services, not lorem ipsum is simply free text of used by refreshing. Neque porro este qui dolorem ipsum quia.",
    image: listinglogo,
  },
];

const Arrow = ({ className, style, onClick, direction }) => (
  <div
    className={`custom-arrow ${direction}-arrow`}
    onClick={onClick}
    style={{ ...style }}
  >
    {direction === "left" ? <FaChevronLeft /> : <FaChevronRight />} {/* Use React Icons here */}
  </div>
);

const WhatTheySay = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    draggable: true,
    nextArrow: <Arrow direction="right" />,
    prevArrow: <Arrow direction="left" />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-header">
        <p className="subheading">OUR TESTIMONIALS</p>
        <h2>What They Say</h2>
        <p className="desc">
          Lorem ipsum dolor sit amet, cibo mundi ea duo, vim exerci phaedrum
        </p>
      </div>

      <div className="testimonial-slider-wrapper">
        <Slider {...settings}>
          {testimonials.map((item, index) => (
            <div className="testimonial-card" key={index}>
              <div className="profile-pic">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="testimonial-text">
                <p>{item.text}</p>
                <h4>
                  {item.name}, <span>{item.role}</span>
                </h4>
              </div>
              <div className="quote-icon">❞</div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default WhatTheySay;
