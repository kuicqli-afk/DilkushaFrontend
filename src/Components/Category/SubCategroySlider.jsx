import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";

import "swiper/css";
import "./Category.css";

const BASE_URL = "https://backend.shyamnamkeenandbakers.online/api";

// All possible subcategory API endpoints to try
const SUB_ENDPOINTS = [
  "/subcategory/subcategories",
  "/subcategories",
  "/category/subcategories",
];

const SubCategorySlider = ({ categoryCode, onSelectSubCategory, onHasSubcategoriesChange }) => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryCode) {
      setLoading(false);
      onHasSubcategoriesChange?.(false);
      return;
    }

    setLoading(true);

    const decoded = decodeURIComponent(categoryCode || "").trim().toLowerCase();

    // 1. Fetch categories (to get embedded subs + matched category id/name)
    // 2. Try all known subcategory endpoints simultaneously
    const subRequests = SUB_ENDPOINTS.map((ep) =>
      axios.get(`${BASE_URL}${ep}`).catch(() => null)
    );

    Promise.all([
      axios.get(`${BASE_URL}/category/categories`).catch(() => null),
      ...subRequests,
    ]).then(([catRes, ...subResults]) => {
      // --- Parse categories ---
      const categoryData = catRes
        ? catRes.data?.categories || catRes.data?.data || catRes.data || []
        : [];

      const matchedCategory = categoryData.find(
        (c) =>
          (c.name || c.title || "").trim().toLowerCase() === decoded ||
          c._id === categoryCode
      );

      const matchedCatId = matchedCategory?._id || "";
      const matchedCatName = matchedCategory?.name || categoryCode;

      // --- Collect from all subcategory API responses ---
      let allSubDocs = [];
      subResults.forEach((res) => {
        if (!res) return;
        const list =
          res.data?.subcategories ||
          res.data?.data ||
          res.data?.subCategories ||
          (Array.isArray(res.data) ? res.data : []);
        allSubDocs = [...allSubDocs, ...list];
      });

      // Deduplicate by _id
      const seen = new Set();
      allSubDocs = allSubDocs.filter((s) => {
        const id = s._id || s.id || s.name;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // Filter by parent category (try all common field names)
      const matchingSubs = allSubDocs.filter((sub) => {
        if (sub.hidden) return false;

        const parentId =
          sub.parentCategoryId?._id ||
          sub.parentCategoryId?.id ||
          sub.parentCategoryId ||
          sub.categoryId?._id ||
          sub.categoryId ||
          sub.category?._id ||
          sub.category;

        const parentName =
          sub.parentCategoryId?.name ||
          sub.parentCategory ||
          sub.categoryName ||
          sub.category?.name ||
          "";

        return (
          (matchedCatId && parentId === matchedCatId) ||
          parentName.trim().toLowerCase() === decoded ||
          parentId === categoryCode
        );
      });

      // --- Also check embedded subcategories in category object ---
      const embeddedSubs =
        matchedCategory?.subcategories ||
        matchedCategory?.subCategories ||
        matchedCategory?.subcategoryList ||
        [];

      const combined = [...matchingSubs];
      embeddedSubs.forEach((es) => {
        const id = typeof es === "string" ? es : es._id || es.id || es.name;
        if (!combined.some((s) => (s._id || s.name) === id)) {
          combined.push(
            typeof es === "string" ? { _id: es, name: es, image: null } : es
          );
        }
      });

      // --- Normalize ---
      const normalized = combined.map((s) =>
        typeof s === "string"
          ? { _id: s, name: s, image: null }
          : {
            _id: s._id || s.name,
            name: s.name || s.title,
            image: s.image || s.img || null,
          }
      );

      setSubs(normalized);
      onHasSubcategoriesChange?.(normalized.length > 0);
    })
      .catch((err) => {
        console.error("SubCategorySlider error:", err);
        setSubs([]);
        onHasSubcategoriesChange?.(false);
      })
      .finally(() => setLoading(false));
  }, [categoryCode, onHasSubcategoriesChange]);

  const handleSubCategoryClick = (item) => {
    if (onSelectSubCategory) onSelectSubCategory(item);
    if (categoryCode && item.name) {
      navigate(
        `/category/${encodeURIComponent(categoryCode)}/${encodeURIComponent(item.name)}`
      );
    }
  };

  if (loading) return null;
  if (!subs.length) return null;

  return (
    <div className="explore-menu">
      <div className="explore-menu-wrapper">
        <Swiper
          modules={[FreeMode, Autoplay]}
          loop={subs.length > 5}
          speed={1000}
          freeMode={{ enabled: true }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 2.2, spaceBetween: 10 },
            480: { slidesPerView: 3.2, spaceBetween: 12 },
            768: { slidesPerView: 4.2, spaceBetween: 15 },
            1024: { slidesPerView: 6, spaceBetween: 18 },
            1300: { slidesPerView: 7, spaceBetween: 18 },
            1800: { slidesPerView: 9, spaceBetween: 18 },
          }}
        >
          {subs.map((item) => (
            <SwiperSlide key={item._id}>
              <div
                className="explore-menu-list-item"
                onClick={() => handleSubCategoryClick(item)}
                style={{ cursor: "pointer" }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="icon-box">
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "#ff4d4d" }}>
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
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