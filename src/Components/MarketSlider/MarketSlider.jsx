import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import './MarketSlider.css';

import P1 from '../../assets/Janpath.jpg';
import P2 from '../../assets/Refugee.jpg';
import P3 from '../../assets/Partap.jpg';
import P4 from '../../assets/Parta.jpg';
import P5 from '../../assets/Shriram.jpg';
import P6 from '../../assets/Halwasiya.jpg';

const categories = [
  { src: P1, text: 'Aminabad', link: '#' },
  { src: P2, text: 'Chowk', link: '#' },
  { src: P3, text: 'Hazratganj', link: '#' },
  { src: P4, text: 'Patrakarpuram', link: '#' },
  { src: P5, text: 'Akbari Gate', link: '#' },
  { src: P6, text: 'Aliganj & Indira Nagar', link: '#' },
];

export const MarketSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="market-category-section">
      <div className="market-text-content">
        <h5>AROUND THE CITY</h5>
        <h2>Lucknow Popular Food Areas</h2>
        <p>Explore your popular areas shops and see what big discount & offers going on</p>
      </div>

      <div className="market-category-wrapper">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          slidesPerView={4}
          spaceBetween={20}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
        >
          {categories.map((cat, index) => (
            <SwiperSlide key={index}>
              <div className={`market-category-item ${activeIndex === index ? 'active' : ''}`}>
                <Link to={cat.link}>
                  <img src={cat.src} alt={cat.text} />
                  <p>{cat.text}</p>
                </Link>
                <div className="active-line"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
