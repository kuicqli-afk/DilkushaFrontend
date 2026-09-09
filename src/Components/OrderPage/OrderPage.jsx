import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaRegHeart, FaStar, FaRegBookmark, FaBookmark, FaTimes } from "react-icons/fa";
import { useCart } from "../../Context/CartContext.jsx";
import { useWishlist } from "../../Context/WishlistContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

import "./Order.css";

import OpenIcon from "../../assets/Open.png";
import CloseIcon from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import StarIcon from "../../assets/StarIcon.png";

import MaidaItems from "../Food/MaidaItems.jsx";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

// Helper function to scale weight and automatically convert units (e.g., 500g * 2 = 1kg)
const getScaledWeight = (weight, unit, quantity) => {
  if (!weight || isNaN(weight)) return "";

  const baseWeight = Number(weight) * quantity;
  const unitLower = (unit || "").toLowerCase().trim();

  if (unitLower === "g" || unitLower === "gm" || unitLower === "grams") {
    if (baseWeight >= 1000) {
      const kgVal = baseWeight / 1000;
      return `${Number.isInteger(kgVal) ? kgVal : kgVal.toFixed(2)}kg`;
    }
    return `${baseWeight}g`;
  }

  if (unitLower === "ml") {
    if (baseWeight >= 1000) {
      const lVal = baseWeight / 1000;
      return `${Number.isInteger(lVal) ? lVal : lVal.toFixed(2)}L`;
    }
    return `${baseWeight}ml`;
  }

  return `${Number.isInteger(baseWeight) ? baseWeight : baseWeight.toFixed(2)}${unit || ""}`;
};

const OrderPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { cartItems, setItemQty, getCartKey } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(2); // 🆕 pagination — 2, then +3 each click
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(0);

  const [posting, setPosting] = useState(false);

  const [categoriesData, setCategoriesData] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  if (!state || !state.item) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>No order found</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "12px" }}>
          Go to Home
        </button>
      </div>
    );
  }

  const { item } = state;

  const productImages = React.useMemo(() => {
    let imgs = [];
    if (item.images && Array.isArray(item.images)) {
      imgs = [...item.images];
    }
    if (item.image && !imgs.includes(item.image)) {
      imgs.unshift(item.image);
    }
    return imgs.filter(Boolean);
  }, [item]);

  const isAvailable =
    item.isAvailable !== undefined
      ? item.isAvailable
      : item.stock !== undefined
        ? item.stock > 0
        : item.status?.toLowerCase() !== "out of stock";

  const bookmarked = isInWishlist(item);

  const resolveCategoryName = (catValue) => {
    if (!catValue) return "";
    if (typeof catValue === "object") {
      return catValue.name || catValue.title || "";
    }
    const looksLikeObjectId = /^[a-f\d]{24}$/i.test(catValue);
    if (looksLikeObjectId) {
      const found = categoriesData.find((c) => c._id === catValue);
      return found ? found.name || found.title : "";
    }
    return catValue;
  };

  const categoryName = resolveCategoryName(item.category);
  const subcategoryName = resolveCategoryName(item.subcategory);

  const basePrice = item.price || 0;
  const baseOffer = item.offer || 0;

  const scaledPrice = basePrice * qty;
  const scaledOffer = baseOffer * qty;
  const scaledWeightDisplay = getScaledWeight(item.weight, item.unit, qty);

  useEffect(() => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    setQty(found ? found.quantity : 1);
  }, [item, cartItems, getCartKey]);

  useEffect(() => {
    setSelectedImage(item.image || productImages[0] || "");
  }, [item, productImages]);

  useEffect(() => {
    const restaurantId =
      typeof item.restaurantId === "object" ? item.restaurantId?._id : item.restaurantId;

    if (!restaurantId) {
      setRestaurantLoading(false);
      return;
    }

    setRestaurantLoading(true);

    axios
      .get(`${BASE_URL}/restaurant/${restaurantId}`)
      .then((res) => setRestaurant(res.data.data || null))
      .catch((err) => {
        console.error("Fetch restaurant error:", err);
        setRestaurant(null);
      })
      .finally(() => setRestaurantLoading(false));
  }, [item]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/category/categories`)
      .then((res) => {
        const categoryData = res.data.categories || res.data.data || res.data || [];
        setCategoriesData(categoryData);
        const names = categoryData.map((cat) => cat.name || cat.title);
        setAllCategories(names);
      })
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

  const fetchReviews = useCallback(() => {
    if (!item._id) {
      setReviewsLoading(false);
      return;
    }

    setReviewsLoading(true);

    axios
      .get(`${BASE_URL}/reviews/product/${item._id}`)
      .then((res) => {
        setReviews(res.data.data || []);
      })
      .catch((err) => {
        console.error("Fetch reviews error:", err);
        setReviews([]);
      })
      .finally(() => setReviewsLoading(false));
  }, [item._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const handleQuantityChange = (newQty) => {
    if (!isAvailable) return;
    if (newQty > 10) {
      alert("You can add a maximum of 10 items at a time.");
      return;
    }

    const targetQty = Math.max(1, newQty);
    setQty(targetQty);
    setItemQty(item, targetQty);
  };

  const increase = () => handleQuantityChange(qty + 1);
  const decrease = () => handleQuantityChange(qty - 1);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    setItemQty(item, qty);
  };

  const handlePlaceOrder = () => {
    if (!isAvailable) return;
    setItemQty(item, qty);
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    toggleWishlist(item);
  };

  // 🆕 Reset pagination back to 2 every time the modal is opened
  const handleOpenReviewModal = () => {
    setVisibleReviewsCount(2);
    setIsReviewModalOpen(true);
  };

  const handlePostReview = async (e) => {
    if (e) e.preventDefault();

    if (newRating === 0) {
      alert("Please select a star rating.");
      return;
    }

    if (!newName.trim() || !newComment.trim()) {
      alert("Please enter your name and a review comment.");
      return;
    }

    setPosting(true);

    try {
      await axios.post(`${BASE_URL}/reviews/add`, {
        productId: item._id,
        name: newName.trim(),
        comment: newComment.trim(),
        rating: newRating,
      });

      setNewName("");
      setNewComment("");
      setNewRating(0);
      fetchReviews();
    } catch (err) {
      console.error("Post review error:", err);
      alert(err.response?.data?.message || "Failed to post review.");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      const res = await axios.put(`${BASE_URL}/reviews/like/${reviewId}`, {
        guestId: getGuestId(),
      });

      setReviews((prev) =>
        prev.map((rev) => (rev._id === reviewId ? res.data.data : rev))
      );
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    }
  };

  const handleDislike = async (reviewId) => {
    try {
      const res = await axios.put(`${BASE_URL}/reviews/dislike/${reviewId}`, {
        guestId: getGuestId(),
      });

      setReviews((prev) =>
        prev.map((rev) => (rev._id === reviewId ? res.data.data : rev))
      );
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    }
  };

  const currentRating = Number(item.rating) || 0;

  return (
    <>
      <div className="food-container">
        <div className="order-container">
          <span>
            Home / {categoryName || "Products"} {subcategoryName ? `/ ${subcategoryName}` : ""}
          </span>

          <div className="order-card">
            <div className="order-image-box" style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
              {productImages.length > 1 ? (
                <div
                  className="order-thumbnails"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    overflowY: "auto",
                    paddingRight: "2px",
                  }}
                >
                  {productImages.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`${item.title} thumbnail ${idx + 1}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      style={{
                        width: "130px",
                        height: "110px",
                        objectFit: "fill",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              ) : (
                // 🆕 Demo placeholder thumbnails — shown only when there are no real side images
                <div
                  className="order-thumbnails order-thumbnails-demo"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    paddingRight: "2px",
                  }}
                >
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      style={{
                        width: "130px",
                        height: "110px",
                        borderRadius: "8px",
                        background: "#f1f5f9",
                        border: "1px dashed #cbd5e1",
                      }}
                    />
                  ))}
                </div>
              )}

              <div style={{ position: "relative", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {selectedImage && (
                  <img key={selectedImage} src={selectedImage} alt={item.title} className="order-image" />
                )}

                <img
                  className="order-type-icon"
                  src={item.type === "veg" ? GreenArrow : RedArrow}
                  alt=""
                />
              </div>
            </div>

            <div className="order-details">
              <div className="order-status">
                <img src={item.isOpen ? OpenIcon : CloseIcon} alt="" />
                <p className={`stock-status ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </p>

                <div className="order-status-icons">
                  <FaRegHeart
                    style={{
                      fontSize: "24px",
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                  />

                  {bookmarked ? (
                    <FaBookmark
                      style={{ fontSize: "20px", cursor: "pointer", color: "red" }}
                      title="Remove from Wishlist"
                      onClick={handleToggleWishlist}
                    />
                  ) : (
                    <FaRegBookmark
                      style={{ fontSize: "20px", cursor: "pointer", color: "#6b7280" }}
                      title="Add to Wishlist"
                      onClick={handleToggleWishlist}
                    />
                  )}
                </div>
              </div>

              <h2 className="order-food-title">
                {item.title} {scaledWeightDisplay && <span>{scaledWeightDisplay}</span>}
              </h2>

              <p className="food-desc1">{(item.desc || "").slice(0, 300)}</p>

              <div className="food-rating" style={{ display: "flex", alignItems: "center", gap: "6px", margin: "10px 0" }}>
                <span className="rating-number" style={{ fontWeight: "bold" }}>{currentRating.toFixed(1)}</span>
                <span className="rating-stars" style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FaStar
                      key={n}
                      size={14}
                      color={n <= Math.round(currentRating) ? "#ffb300" : "#e0e0e0"}
                    />
                  ))}
                </span>
                <span>({reviews.length})</span>
                <span className="rating-dot">•</span>
                <span className="orders-last-week" style={{ color: "#666", fontSize: "14px" }}>
                  {item.orders || 0} order{(item.orders || 0) === 1 ? "" : "s"} last week
                </span>

                <button
                  onClick={handleOpenReviewModal}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#880559",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "16px",
                    marginLeft: "auto",

                  }}
                >
                  Customer Reviews ({reviews.length})
                </button>
              </div>

              <div className="order-price-row">
                <small className="order-price">
                  <span className="rs">₹</span> {scaledPrice}
                </small>
                {baseOffer > 0 && (
                  <span className="offer1">
                    <small className="offer1">₹</small>
                    {scaledOffer}
                  </span>
                )}
                {item.off > 0 && <span className="food-off">{item.off}% OFF</span>}
              </div>

              <div className="food-action">
                <button
                  className="order-btnn"
                  onClick={handlePlaceOrder}
                  disabled={!isAvailable}
                  style={{
                    opacity: isAvailable ? 1 : 0.5,
                    cursor: isAvailable ? "pointer" : "not-allowed",
                  }}
                >
                  {isAvailable ? "Place order" : "Out of Stock"}
                </button>

                <div className="adds" onClick={handleAddToCart} style={{ cursor: isAvailable ? "pointer" : "not-allowed", opacity: isAvailable ? 1 : 0.5 }}></div>

                <div className="add-btnn" style={{ opacity: isAvailable ? 1 : 0.5 }}>
                  <button onClick={decrease} disabled={!isAvailable}>-</button>
                  <span>{qty}</span>
                  <button onClick={increase} disabled={!isAvailable}>+</button>
                </div>
              </div>
            </div>

            <div className="highlights-box">
              <h3 className="highlights-title">Highlights</h3>

              <div className="highlights-scroll">
                <div className="highlights-list">
                  {item.brand && (
                    <div className="highlight-row">
                      <span className="highlight-label">Brand</span>
                      <span className="highlight-value">{item.brand}</span>
                    </div>
                  )}

                  {item.productType && (
                    <div className="highlight-row">
                      <span className="highlight-label">Dietary Preference</span>
                      <span className="highlight-value">{item.productType}</span>
                    </div>
                  )}

                  {item.type && (
                    <div className="highlight-row">
                      <span className="highlight-label">Product Type</span>
                      <span className="highlight-value">{item.type === "veg" ? "Veg" : "Non-Veg"}</span>
                    </div>
                  )}

                  {item.spiceLevel && (
                    <div className="highlight-row">
                      <span className="highlight-label">Spice Level</span>
                      <span className="highlight-value">{item.spiceLevel}</span>
                    </div>
                  )}

                  {item.flavour && (
                    <div className="highlight-row">
                      <span className="highlight-label">Flavour</span>
                      <span className="highlight-value">{item.flavour}</span>
                    </div>
                  )}

                  {item.weight && (
                    <div className="highlight-row">
                      <span className="highlight-label">Weight</span>
                      <span className="highlight-value">{item.weight}{item.unit && item.unit.toLowerCase() !== "pc" ? item.unit : "g"}</span>
                    </div>
                  )}

                  {item.keyFeatures && (
                    <div className="highlight-row highlight-block">
                      <span className="highlight-label">Key Features</span>
                      <p className="highlight-text">{item.keyFeatures}</p>
                    </div>
                  )}

                  {item.weight && (
                    <div className="highlight-row">
                      <span className="highlight-label">Unit</span>
                      <span className="highlight-value">
                        {item.portion ? `${item.portion} ` : " "}
                        {item.weight && (

                          <div className="highlight-row">

                            <span className="highlight-label"></span>

                            <span className="highlight-value">

                              {item.portion || 1} / ({item.weight}g)

                            </span>

                          </div>

                        )}
                      </span>
                    </div>
                  )}

                  {item.ingredients && (
                    <div className="highlight-row highlight-block">
                      <span className="highlight-label">Ingredients</span>
                      <p className="highlight-text">{item.ingredients}</p>
                    </div>
                  )}

                  {item.allergenInfo && (
                    <div className="highlight-row">
                      <span className="highlight-label">Allergen Information</span>
                      <span className="highlight-value">{item.allergenInfo}</span>
                    </div>
                  )}

                  {item.fssaiLicense && (
                    <div className="highlight-row">
                      <span className="highlight-label">FSSAI License</span>
                      <span className="highlight-value">{item.fssaiLicense}</span>
                    </div>
                  )}
                  {item.nutrition && (
                    (Array.isArray(item.nutrition.rows) && item.nutrition.rows.length > 0) ||
                    Object.values(item.nutrition).some((v) => v)
                  ) && (() => {
                    // New shape: rows array. Old shape: fixed fields — convert on the fly so old products still render.
                    const displayRows =
                      Array.isArray(item.nutrition.rows) && item.nutrition.rows.length > 0
                        ? item.nutrition.rows
                        : [
                          ["Energy (Kcal)", item.nutrition.energyKcal],
                          ["Protein (g)", item.nutrition.proteinG],
                          ["Carbohydrate (g)", item.nutrition.carbsG],
                          ["Total Sugar (g)", item.nutrition.sugarG],
                          ["Added Sugar (g)", item.nutrition.addedSugarG],
                          ["Total Fat (g)", item.nutrition.fatG],
                          ["Saturated Fat (g)", item.nutrition.saturatedFatG],
                          ["Trans Fat (g)", item.nutrition.transFatG],
                          ["Sodium (mg)", item.nutrition.sodiumMg],
                        ]
                          .filter(([, val]) => val !== undefined && val !== null && val !== "")
                          .map(([label, per100g]) => ({ label, per100g, rda: "" }));

                    if (displayRows.length === 0) return null;

                    return (
                      <div className="highlight-row highlight-block">
                        <span className="highlight-label">Nutrition Information</span>

                        <div
                          style={{
                            marginTop: "8px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            overflow: "hidden",
                            maxWidth: "420px",
                          }}
                        >
                          {(item.nutrition.servingSize || item.nutrition.servingPerPack) && (
                            <div
                              style={{
                                background: "#f8fafc",
                                padding: "8px 12px",
                                display: "flex",
                                justifyContent: "center",
                                gap: "18px",
                                borderBottom: "1px solid #e5e7eb",
                              }}
                            >
                              {item.nutrition.servingSize && (
                                <span style={{ fontSize: "12px", color: "#475569" }}>
                                  Serving Size: <strong>{item.nutrition.servingSize}</strong>
                                </span>
                              )}
                              {item.nutrition.servingPerPack && (
                                <span style={{ fontSize: "12px", color: "#475569" }}>
                                  Per Pack: <strong>{item.nutrition.servingPerPack}</strong>
                                </span>
                              )}
                            </div>
                          )}

                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                            <thead>
                              <tr style={{ background: "#f1f5f9", color: "#475569" }}>
                                <th style={{ textAlign: "left", padding: "6px 12px", fontWeight: 600 }}>Nutrient</th>
                                <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600 }}>Per 100g</th>
                                <th style={{ textAlign: "center", padding: "6px 8px", fontWeight: 600 }}>%RDA</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayRows.map((row, i) => (
                                <tr
                                  key={i}
                                  style={{
                                    borderTop: "1px solid #f1f5f9",
                                    background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                                  }}
                                >
                                  <td style={{ padding: "6px 12px", color: "#334155", fontWeight: 500 }}>{row.label}</td>
                                  <td style={{ padding: "6px 8px", textAlign: "center", color: "#334155" }}>{row.per100g || "-"}</td>
                                  <td style={{ padding: "6px 8px", textAlign: "center", color: "#334155" }}>{row.rda || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div
                            style={{
                              background: "#f8fafc",
                              padding: "6px 12px",
                              fontSize: "10px",
                              color: "#64748b",
                              textAlign: "center",
                              borderTop: "1px solid #e5e7eb",
                            }}
                          >
                            *%RDA Based on ICMR, 2020 Guidelines (2,000 kcal)
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {item.cuisine && (
                    <div className="highlight-row">
                      <span className="highlight-label">Cuisine Type</span>
                      <span className="highlight-value">{item.cuisine}</span>
                    </div>
                  )}

                  {item.packagingType && (
                    <div className="highlight-row">
                      <span className="highlight-label">Packaging Type</span>
                      <span className="highlight-value">{item.packagingType}</span>
                    </div>
                  )}

                  {item.storageInstruction && (
                    <div className="highlight-row">
                      <span className="highlight-label">Storage Instruction</span>
                      <span className="highlight-value">{item.storageInstruction}</span>
                    </div>
                  )}

                  {item.speciality && (
                    <div className="highlight-row">
                      <span className="highlight-label">Speciality</span>
                      <span className="highlight-value">{item.speciality}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="review">
            {restaurantLoading ? (
              <div className="shop">
                <p className="text-xs text-gray-400">Loading restaurant info...</p>
              </div>
            ) : restaurant ? (
              <div className="shop">
                <h2>Restaurant</h2>

                <div className="img">
                  <img src={restaurant.image} alt={restaurant.title} className="shop-image" />
                  <div className="shop-text">
                    <h3>
                      {restaurant.title}{" "}
                      {restaurant.fssai && <span>(Lic. No. {restaurant.fssai})</span>}
                    </h3>
                    <p>
                      {restaurant.address}, {restaurant.phone}
                    </p>
                  </div>
                </div>

                <div className="order-rating">
                  <img src={StarIcon} alt="" />
                  <h3>
                    <span className="number">{restaurant.rating || 0}</span>{" "}
                    <span>({restaurant.totalRatings || 0})</span>
                  </h3>
                  <p>
                    <span className="number">{restaurant.products || 0}</span> Foods |{" "}
                    <span className="number">{restaurant.followers || 0}</span> Followers
                  </p>
                </div>

                <p className="shop-meta">
                  <span className="label">Status:</span> {restaurant.status} |{" "}
                  <Link to="/restaurant-detail" state={{ restaurant }}>
                    <button className="view-resto">View Restaurant</button>
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isReviewModalOpen && (
        <div className="review-modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>Customer Reviews ({reviews.length})</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="modal-close-btn">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handlePostReview} className="review-form">
              <div className="review-form-group">
                <label className="review-form-label">
                  Rating <span className="required-star">*</span>
                </label>
                <div className="star-rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={22}
                      className="picker-star"
                      color={newRating >= star ? "#ffb300" : "#e0e0e0"}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </div>
              </div>

              <div className="review-form-group">
                <input
                  type="text"
                  placeholder="Your name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="review-input"
                />
              </div>

              <div className="review-form-group">
                <textarea
                  placeholder="Write a review..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="review-textarea"
                  rows="3"
                />
              </div>

              <div className="review-form-footer">
                <button type="submit" disabled={posting} className="post-review-btn">
                  {posting ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>

            {reviewsLoading ? (
              <p className="reviews-status-text">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="reviews-status-text">No reviews yet. Be the first to review!</p>
            ) : (
              <>
                <div className="reviews-list-container">
                  {reviews.slice(0, visibleReviewsCount).map((rev) => (
                    <div key={rev._id} className="review-card-item">
                      <div className="review-dp">
                        {rev.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="review-details">
                        <div className="review-header-row">
                          <h4 className="reviewer-name">{rev.name}</h4>
                          <div className="review-stars-display">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                size={12}
                                color={rev.rating >= star ? "#ffb300" : "#e0e0e0"}
                              />
                            ))}
                          </div>
                        </div>

                        {/* 🆕 Comment + like/dislike now share one row */}
                        <div className="review-comment-row">
                          <p className="review-comment-text">{rev.comment}</p>
                          <div className="review-action-row">
                            <button onClick={() => handleLike(rev._id)} className="action-btn">
                              <FontAwesomeIcon icon={faThumbsUp} />
                              <span>{rev.likes || 0}</span>
                            </button>
                            <button onClick={() => handleDislike(rev._id)} className="action-btn">
                              <FontAwesomeIcon icon={faThumbsDown} />
                              <span>{rev.dislikes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🆕 Show More — reveals 3 more each click (2 → 5 → 8 → ...) */}
                {/* 🆕 Show More / Hide toggle — expands 3 at a time (2 → 5 → 8...), 
                    collapses back to 2 once everything is shown */}
                <div className="show-more-wrapper">
                  {visibleReviewsCount < reviews.length ? (
                    <button
                      className="show-more-btn"
                      onClick={() => setVisibleReviewsCount((prev) => prev + 3)}
                    >
                      Show More
                    </button>
                  ) : (
                    reviews.length > 2 && (
                      <button
                        className="show-more-btn hide-btn"
                        onClick={() => setVisibleReviewsCount(2)}
                      >
                        Hide less
                      </button>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {allCategories.map((cat) => (
        <MaidaItems key={cat} category={cat} excludeId={item._id} />
      ))}
    </>
  );
};

export default OrderPage;