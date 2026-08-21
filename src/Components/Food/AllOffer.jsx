import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "./AllOffer.css"
const AllOffer = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("https://shyambackend.onrender.com/api/offers")
      .then(res => setOffers(res.data.offers))
      .catch(err => console.log(err));
  }, []);

  return (
    <section className="offer-section">
      <Swiper
        modules={[Navigation, Autoplay]}
        loop={offers.length > 4}   // ✅ loop fix
        speed={700}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation={{ nextEl: ".offer-next", prevEl: ".offer-prev" }}
        breakpoints={{
          300: { slidesPerView: 1, spaceBetween: 20 },
          400: { slidesPerView: 1.3, spaceBetween: 20 },
          500: { slidesPerView: 1.5, spaceBetween: 20 },
          700: { slidesPerView: 2, spaceBetween: 18 },
          800: { slidesPerView: 2.5, spaceBetween: 18 },
          900: { slidesPerView: 2.5, spaceBetween: 23 },
          1000: { slidesPerView: 3, spaceBetween: 18 },
          1224: { slidesPerView: 3.8, spaceBetween: 23 },
          1300: { slidesPerView: 4, spaceBetween: 16 },
          1500: { slidesPerView: 4, spaceBetween: 20 },
          1600: { slidesPerView: 5, spaceBetween: 16 },
        }}
        className="offer-swiper"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer._id}>
            <div
              className="offer-card"
              onClick={() => navigate(`/offers/${offer.slug}`)}
            >
              <img
                src={offer.image}
                alt={offer.title}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button className="offer-prev">‹</button>
      <button className="offer-next">›</button>
    </section>
  );
};

export default AllOffer;