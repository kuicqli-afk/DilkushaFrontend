import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules"; // ✅ added Navigation
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation"; // ✅ Navigation CSS
import "./Category.css";

import P1 from "../../assets/bakery.png";
import P2 from "../../assets/sweetshop.png";
import P3 from "../../assets/sportoutlet.png";
import P4 from "../../assets/beautyproduct.png";
import P5 from "../../assets/fashion.png";
import P6 from "../../assets/jewellery.png";
import P7 from "../../assets/furniture.png";
import P8 from "../../assets/shoes.png";

const categories = [
  { src: P1, text: "Bakery Shops", link: "/#" },
  { src: P2, text: "Sweets Shops", link: "/#" },
  { src: P3, text: "Sports Outlets", link: "/#" },
  { src: P4, text: "Beauty Products", link: "/#" },
  { src: P5, text: "Fashion Outlet", link: "/#" },
  { src: P6, text: "Jewellery Stores", link: "/#" },
  { src: P7, text: "Furniture Stores", link: "/#" },
  { src: P8, text: "Shoes Stores", link: "/#" },
];

export const Categories = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="category-container">
      <Swiper
        modules={[Autoplay, Navigation]} // ✅ Navigation added here
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        spaceBetween={10}
        slidesPerView={6}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 6 },
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        navigation={{
          nextEl: ".arrow-btn.right", // ✅ custom arrow selectors
          prevEl: ".arrow-btn.left",
        }}
        className="category-slider"
      >
        {categories.map((cat, index) => (
          <SwiperSlide key={index}>
            <div
              className={`category-item ${
                index === activeIndex ? "active" : ""
              }`}
            >
              <Link to={cat.link}>
                <img src={cat.src} alt={cat.text} />
                <p>{cat.text}</p>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ Custom navigation arrows */}
      <button className="arrow-btn left">&#10094;</button>
      <button className="arrow-btn right">&#10095;</button>
    </div>
  );
};
