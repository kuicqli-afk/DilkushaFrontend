import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import "./Category.css";

const BASE_URL = "http://localhost:5000/api";

const SubCategorySlider = ({ categoryCode, onSelectSubCategory }) => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryCode) {
      setLoading(false);
      return;
    }

    setLoading(true);

    axios
      .get(`${BASE_URL}/category/categories`)
      .then((res) => {
        const categoryData = res.data.categories || res.data.data || res.data || [];

        // ✅ FIX: categoryCode actually category ka NAME hai, ID nahi.
        // Us naam se poora category object dhundo, phir uske andar embedded
        // subcategories array nikalo (jaisa Product.jsx ke dropdown mein assume kiya tha)
        const matchedCategory = categoryData.find(
          (c) => (c.name || c.title) === categoryCode
        );

        const rawSubs =
          matchedCategory?.subcategories ||
          matchedCategory?.subCategories ||
          matchedCategory?.subcategoryList ||
          [];

        // Normalize: string array ho sakta hai, ya object array {name, image} bhi ho sakta hai
        const normalized = rawSubs.map((s) =>
          typeof s === "string"
            ? { _id: s, name: s, image: null }
            : { _id: s._id || s.name, name: s.name || s.title, image: s.image || null }
        );

        setSubs(normalized);
      })
      .catch((err) => {
        console.error("Error fetching subcategories:", err);
        setSubs([]);
      })
      .finally(() => setLoading(false));
  }, [categoryCode]);

  const handleSubCategoryClick = (item) => {
    if (onSelectSubCategory) {
      onSelectSubCategory(item);
    }

    const subName = item.name;

    if (categoryCode && subName) {
      navigate(`/category/${encodeURIComponent(categoryCode)}/${encodeURIComponent(subName)}`);
    }
  };

  if (loading) return null;
  if (!subs.length) return null;

  return (
    <div className="explore-menu">
      <div className="explore-menu-wrapper">
        <Swiper
          modules={[FreeMode, Autoplay, Pagination]}
          loop={subs.length > 5}
          speed={1000}
          freeMode={{ enabled: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 2.2 },
            480: { slidesPerView: 3.2 },
            768: { slidesPerView: 4.2 },
            1024: { slidesPerView: 6 },
            1300: { slidesPerView: 7 },
            1800: { slidesPerView: 9 },
          }}
        >
          {subs.map((item) => (
            <SwiperSlide key={item._id}>
              <div
                className="explore-menu-list-item"
                onClick={() => handleSubCategoryClick(item)}
                style={{ cursor: "pointer" }}
              >
                {item.image && <img src={item.image} alt={item.name} />}
                <p>{item.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SubCategorySlider;