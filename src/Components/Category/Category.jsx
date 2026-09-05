import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay, Pagination } from "swiper/modules";
import { BiCategory } from "react-icons/bi";

import "swiper/css";
import "swiper/css/pagination";
import "./Category.css";

// 🆕 Fisher-Yates shuffle — randomizes category order on every fresh page load/refresh
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Category = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          "https://shyamfoodbackend.onrender.com/api/category/categories"
        );

        const categoryData = res.data.categories || res.data.data || res.data || [];
        const visibleCategories = categoryData.filter((cat) => !cat.hidden);

        setCategories(shuffleArray(visibleCategories)); // 🆕 random category order every page load
      } catch (err) {
        console.error("API Error Details:", err.response || err.message || err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (item) => {
    if (onSelectCategory) {
      onSelectCategory(item);
    }
    navigate(`/category/${encodeURIComponent(item.name)}`);
  };

  if (loading) {
    return (
      <div className="explore-menu-loading" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-menu-error" style={{ textAlign: "center", padding: "20px", color: "red" }}>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: "10px", padding: "6px 12px", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  }

  const displayList = categories;

  return (
    <section style={{ marginTop: "45px" }} className="explore-menu" aria-label="Product Categories">
      <div className="explore-menu-wrapper">
        <Swiper
          modules={[FreeMode, Autoplay, Pagination]}
          loop={displayList.length >= 8}
          speed={800}
          freeMode={{
            enabled: true,
            sticky: false,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          pagination={{
            el: ".category-dots",
            clickable: true,
            bulletClass: "dot",
            bulletActiveClass: "active",
          }}
          breakpoints={{
            320: { slidesPerView: 3.5, spaceBetween: 6 },
            480: { slidesPerView: 4.5, spaceBetween: 8 },
            640: { slidesPerView: 4.5, spaceBetween: 12 },
            768: { slidesPerView: 6, spaceBetween: 16 },
            1024: { slidesPerView: 7, spaceBetween: 18 },
            1280: { slidesPerView: 8.5, spaceBetween: 20 },
            1536: { slidesPerView: 10, spaceBetween: 22 },
          }}
        >
          {displayList.map((item) => (
            <SwiperSlide key={item._id}>
              {item.isAll ? (
                <div
                  className="explore-menu-list-item"
                  onClick={() => navigate("/category/all")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="icon-box">
                    <BiCategory aria-hidden="true" />
                  </div>
                  <p>{item.name}</p>
                </div>
              ) : (
                <div
                  className="explore-menu-list-item"
                  onClick={() => handleCategoryClick(item)}
                  role="button"
                  tabIndex={0}
                >
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <p>{item.name}</p>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="category-dots" aria-hidden="true"></div>
      </div>
    </section>
  );
};

export default Category;