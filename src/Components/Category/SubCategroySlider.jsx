import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import "./Category.css";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

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

    Promise.allSettled([
      axios.get(`${BASE_URL}/category/categories`),
      axios.get(`${BASE_URL}/subcategory/subcategories`),
    ])
      .then(([catRes, subRes]) => {
        const categoryData =
          catRes.status === "fulfilled"
            ? catRes.value.data.categories || catRes.value.data.data || catRes.value.data || []
            : [];
        const subcategoryData =
          subRes.status === "fulfilled"
            ? subRes.value.data.subcategories || subRes.value.data.data || subRes.value.data || []
            : [];

        // Find the matching category object
        const matchedCategory = categoryData.find(
          (c) =>
            (c.name && c.name.toLowerCase() === categoryCode.toLowerCase()) ||
            (c.code && c.code.toLowerCase() === categoryCode.toLowerCase()) ||
            c._id === categoryCode
        );

        const matchedCatId = matchedCategory?._id || categoryCode;
        const matchedCatName = matchedCategory?.name || categoryCode;

        // Filter subcategories by parentCategoryId
        const matchingSubs = subcategoryData.filter((sub) => {
          if (sub.hidden) return false;
          const parentId =
            sub.parentCategoryId?._id || sub.parentCategoryId?.id || sub.parentCategoryId;
          const parentName = sub.parentCategoryId?.name || sub.parentCategory;
          return (
            parentId === matchedCatId ||
            (parentName && parentName.toLowerCase() === matchedCatName.toLowerCase())
          );
        });

        // Also check any embedded subcategories if present
        const embeddedSubs =
          matchedCategory?.subcategories ||
          matchedCategory?.subCategories ||
          matchedCategory?.subcategoryList ||
          [];

        const combined = [...matchingSubs];
        embeddedSubs.forEach((es) => {
          const id = typeof es === "string" ? es : es._id || es.id || es.name;
          if (!combined.some((s) => (s._id || s.id) === id)) {
            combined.push(typeof es === "string" ? { _id: es, name: es, image: null } : es);
          }
        });

        // Normalize
        const normalized = combined.map((s) =>
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
