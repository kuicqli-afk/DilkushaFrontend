import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay, Pagination } from "swiper/modules";
import { BiCategory } from "react-icons/bi";

import "swiper/css";
import "swiper/css/pagination";
import "./Category.css";

const Category = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          "https://shyamfoodbackend.onrender.com/api/category/categories"
        );

        const categoryData = res.data.categories || res.data.data || res.data || [];

        // 🆕 sirf visible (non-hidden) categories hi customer ko dikhao
        const visibleCategories = categoryData.filter((cat) => !cat.hidden);

        setCategories(visibleCategories);
      } catch (err) {
        console.error("API Error Details:", err.response || err.message || err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  const scrollToSection = (slug) => {
    setTimeout(() => {
      const el = document.getElementById(slug);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const handleCategoryClick = (item) => {
    if (onSelectCategory) {
      onSelectCategory(item);
    }

    const slug = getSlug(item.name);
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
    <section className="explore-menu" aria-label="Product Categories">
      <div className="explore-menu-wrapper">
        <Swiper
          modules={[FreeMode, Autoplay, Pagination]}
          loop={displayList.length > 5}
          speed={1000}
          freeMode={{ enabled: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{
            el: ".category-dots",
            clickable: true,
            bulletClass: "dot",
            bulletActiveClass: "active",
          }}
          breakpoints={{
            0: { slidesPerView: 2.2, spaceBetween: 10 },
            480: { slidesPerView: 3.2, spaceBetween: 12 },
            768: { slidesPerView: 4.2, spaceBetween: 15 },
            912: { slidesPerView: 5, spaceBetween: 15 },
            1024: { slidesPerView: 6, spaceBetween: 18 },
            1100: { slidesPerView: 7, spaceBetween: 18 },
            1280: { slidesPerView: 9, spaceBetween: 18 },
            1800: { slidesPerView: 9, spaceBetween: 18 },
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