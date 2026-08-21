import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import "./Popular.css";
import img1 from "../../assets/restaurant1.jpg";
import img2 from "../../assets/restaurant.png";
import img3 from "../../assets/restaurant5.jpg";
import img4 from "../../assets/restaurant2.png";
import img5 from "../../assets/restaurant1.png";
import img6 from "../../assets/restaurant2.png";
import img7 from "../../assets/restaurant1.jpg";
import img8 from "../../assets/restaurant4.jpg";
import img9 from "../../assets/restaurant2.png";
import { FaArrowRight, FaArrowRightArrowLeft } from "react-icons/fa6";

const shopSlides = [
  { src: img1, text: "Khuramnagar", listings: 1, link: "/restaurant/khuramnagar" },
  { src: img2, text: "Indiranagar", listings: 1, link: "/restaurant/indiranagar" },
  { src: img3, text: "Nishatganj", listings: 0, link: "/restaurant/nishatganj" },
  { src: img4, text: "Aliganj", listings: 0, link: "/restaurant/aliganj" },
  { src: img5, text: "Kapoorthala", listings: 0, link: "/restaurant/kapoorthala" },
  { src: img6, text: "Aminabad", listings: 0, link: "/restaurant/aminabad" },
  { src: img7, text: "Gomtinagar", listings: 1, link: "/restaurant/gomtinagar" },
  { src: img8, text: "Alambagh", listings: 1, link: "/restaurant/alambagh" },
  { src: img9, text: "Daliganj", listings: 1, link: "/restaurant/daliganj" },
  { src: img5, text: "Kalyanpur", listings: 1, link: "/restaurant/kalyanpur" },
];



const Popular = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="shop-slider-wrapper">
      <div className="title-section">
        <p className="around-city">AROUND THE CITY</p>
        <h2 className="main-heading">Lucknow Popular Restaurants</h2>
        <p className="subtitle">
          Explore popular restaurants in your area and enjoy exciting discounts and special offers.
        </p>

      </div>

      <Swiper
        modules={[FreeMode, Autoplay]}
        freeMode={true}
        loop={true}
        speed={1000}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
        }}
        slidesPerView={1.2}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1200: { slidesPerView: 5 },
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
      >
        {shopSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Link to={slide.link} className="slide-link">
              <div className={`slide-container ${index === activeIndex ? "active" : ""}`}>
                <img src={slide.src} alt={slide.text} className="slide-image" />

                <div className="listing-badge">
                  {slide.listings} {slide.listings === 1 ? "Listing" : "Listings"}
                </div>

                <div className="slide-caption">
                  <div className="caption-top">Restaurants in</div>
                  <div className="caption-bottom">{slide.text}</div>

                  <div className="hover-arrow-btn">
                    <FaArrowRight style={{ color: "white" }} />
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}

      </Swiper>
    </div>
  );
};

export default Popular;
