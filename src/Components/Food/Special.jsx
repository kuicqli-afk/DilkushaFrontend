import React from "react";
import "./AllOffer.css"; // Use the same CSS you just provided

import img1 from "../../assets/alloffer.png";
import img2 from "../../assets/alloffer1.png";
import img3 from "../../assets/alloffer2.png";
import img4 from "../../assets/alloffer3.png";
import img5 from "../../assets/alloffer4.png";
import img6 from "../../assets/alloffer5.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const offers = [img1, img2, img3, img4, img5, img6, img2];

const Special = () => {
  return (
    <section className="food-container">
      <div className="food-text">
        <h1>Special Fresh & Flavorful Bites</h1>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        loop
        speed={700}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        // navigation={{
        //   nextEl: ".offer-next",
        //   prevEl: ".offer-prev",
        // }}
        breakpoints={{
          300: { slidesPerView: 1, spaceBetween: 20 },
          400: { slidesPerView: 1.3, spaceBetween: 20 },
          500: { slidesPerView: 1.5, spaceBetween: 20 },
          700: { slidesPerView: 2, spaceBetween: 18 },
          800: { slidesPerView: 2.5, spaceBetween: 18 },
          1000: { slidesPerView: 3, spaceBetween: 18 },
          1224: { slidesPerView: 3.8, spaceBetween: 23 },
          1300: { slidesPerView: 4, spaceBetween: 16 },
          1500: { slidesPerView: 4, spaceBetween: 20 },
          1600: { slidesPerView: 6, spaceBetween: 8 },
        }}
        className="offer-swiper"
      >
        {offers.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="offers-card">
              <img src={img} alt={`special ${index}`} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* <button className="offers-prev">‹</button>
      <button className="offers-next">›</button> */}
    </section>
  );
};

export default Special;
