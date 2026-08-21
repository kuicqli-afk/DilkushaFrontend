import React, { useState } from 'react';
import './AdsSlider.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css'; // Make sure Swiper styles are imported

import AdsSlider1 from '../../assets/AdsSlider1.jpg';

export const AdsSlider = ({ customImages = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultSlides = [
    AdsSlider1, 
  ];
  const slides = customImages.length > 0 ? customImages : defaultSlides;

  return (
    <div className="container">
      {/* Slider Header */}
      <div className="slider-header">
        <h2>Place Your Ads Here</h2>
        <p>
          Get your business noticed by thousands. Showcase your brand, offers,
          and products — book your ad space today and boost your sales
        </p>
      </div>

      {/* Slider */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        className="fullScreenSwiper"
        onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="slide">
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="slide-image"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
