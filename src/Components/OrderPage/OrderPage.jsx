import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaRegHeart, FaStar } from "react-icons/fa";
import { useCart } from "../../Context/CartContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";

import "./Order.css";

import OpenIcon from "../../assets/Open.png";
import CloseIcon from "../../assets/CLOSE.png";
import RedArrow from "../../assets/NON VEG.png";
import GreenArrow from "../../assets/VEG.png";
import SaveIcon from "../../assets/SaveIcon.png";
import ShareIcon from "../../assets/ShareIcon.png";
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

// Helper function to scale portion/weight strings based on current quantity
const parseAndScalePortion = (portionStr, quantity) => {
  if (!portionStr) return "";
  return portionStr.replace(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/g, (match, num, unit) => {
    const val = parseFloat(num);
    if (isNaN(val)) return match;
    const scaledVal = val * quantity;
    const formatted = Number.isInteger(scaledVal) ? scaledVal : parseFloat(scaledVal.toFixed(2));
    return `${formatted} ${unit}`;
  });
};

const REVIEWS_PAGE_SIZE = 2;

const OrderPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { cartItems, setItemQty, getCartKey } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  const [newComment, setNewComment] = useState("");
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);

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

  // Determine availability status (Matching MaidaItems pattern)
  const isAvailable =
    item.isAvailable !== undefined
      ? item.isAvailable
      : item.stock !== undefined
        ? item.stock > 0
        : item.status?.toLowerCase() !== "out of stock";

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

  // Scaled price and portion calculations
  const basePrice = item.price || 0;
  const baseOffer = item.offer || 0;

  const scaledPrice = basePrice * qty;
  const scaledOffer = baseOffer * qty;
  const scaledPortion = parseAndScalePortion(item.portion || "", qty);

  useEffect(() => {
    const key = getCartKey(item);
    const found = cartItems.find((x) => x.key === key);
    setQty(found ? found.quantity : 1);
  }, [item, cartItems, getCartKey]);

  useEffect(() => {
    setSelectedImage(item.image || "");
  }, [item]);

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
        setVisibleCount(REVIEWS_PAGE_SIZE);
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

  const handlePostReview = async (e) => {
    if (e) e.preventDefault();

    if (!newName.trim() || !newComment.trim()) {
      alert("Please enter your name and a comment.");
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
      setNewRating(5);
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

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < reviews.length;
  const isExpanded = visibleCount > REVIEWS_PAGE_SIZE;

  const handleViewAllReviews = () => {
    setVisibleCount(reviews.length);
  };

  const handleShowLessReviews = () => {
    setVisibleCount(REVIEWS_PAGE_SIZE);
    document.getElementById("customer-reviews-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="food-container">
        <div className="order-container">
          <span>
            Home / {categoryName || "Products"} {subcategoryName ? `/ ${subcategoryName}` : ""}
          </span>

          <div className="order-card">
            <div className="order-image-box">
              {selectedImage && (
                <img key={selectedImage} src={selectedImage} alt={item.title} className="order-image" />
              )}

              <img
                className="order-type-icon"
                src={item.type === "veg" ? GreenArrow : RedArrow}
                alt=""
              />
            </div>

            <div className="order-details">
              <div className="order-status">
                <img src={item.isOpen ? OpenIcon : CloseIcon} alt="" />
                <p className={`stock-status ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </p>

                <div className="order-status-icons">
                  <FaRegHeart style={{ fontSize: "25px", marginTop: "2px", cursor: "pointer" }} />
                  <img src={SaveIcon} alt="" />
                  <img src={ShareIcon} alt="" />
                </div>
              </div>

              <h2 className="order-food-title">
                {item.title} {scaledPortion && <span>({scaledPortion})</span>}
              </h2>

              <p className="food-desc1">{(item.desc || "").slice(0, 300)}</p>

              <div className="order-rating">
                <img src={StarIcon} alt="" />
                <h3>
                  {item.rating || 0} <span>({item.reviews || 0})</span>
                </h3>
                <p>{item.orders || 0} orders last week</p>
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

                <div
                  className="adds"
                  onClick={handleAddToCart}
                  style={{
                    cursor: isAvailable ? "pointer" : "not-allowed",
                    opacity: isAvailable ? 1 : 0.5,
                  }}
                >
                  <span>ADD</span>
                </div>

                <div className="add-btnn" style={{ opacity: isAvailable ? 1 : 0.5 }}>
                  <button onClick={decrease} disabled={!isAvailable}>
                    -
                  </button>
                  <span>{qty}</span>
                  <button onClick={increase} disabled={!isAvailable}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="reviews">
            <div className="review-res" id="customer-reviews-section">
              <h1 className="text-xl font-bold mb-4">Customer Reviews ({reviews.length})</h1>

              <form onSubmit={handlePostReview} className="comments flex flex-col gap-3">
                <div className="flex flex-col gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Write a review..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={20}
                        className="cursor-pointer"
                        color={newRating >= star ? "#ffb300" : "#e0e0e0"}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={posting}>
                    {posting ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>

              {reviewsLoading ? (
                <p className="text-xs text-gray-400 mt-3">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-gray-400 mt-3">No reviews yet. Be the first to review!</p>
              ) : (
                <>
                  {visibleReviews.map((rev) => (
                    <div key={rev._id} className="review-card">
                      <div
                        className="review-dp flex items-center justify-center font-semibold text-white"
                        style={{ background: "#880559" }}
                      >
                        {rev.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="review-content flex-1">
                        <h3>{rev.name}</h3>

                        <div className="flex gap-[2px] my-[2px]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={12}
                              color={rev.rating >= star ? "#ffb300" : "#e0e0e0"}
                            />
                          ))}
                        </div>

                        <p>{rev.comment}</p>
                        <div className="review-actions">
                          <button onClick={() => handleLike(rev._id)} className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faThumbsUp} className="likes" />
                            <span>{rev.likes || 0}</span>
                          </button>

                          <button onClick={() => handleDislike(rev._id)} className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faThumbsDown} className="likes" />
                            <span>{rev.dislikes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(hasMoreReviews || isExpanded) && (
                    <div className="text-center mt-3.5">
                      {hasMoreReviews ? (
                        <button
                          onClick={handleViewAllReviews}
                          className="py-2 px-5 rounded-md border border-[#880559] bg-white text-[#880559] font-semibold text-[13px] cursor-pointer"
                        >
                          View All {reviews.length} Reviews
                        </button>
                      ) : (
                        <button
                          onClick={handleShowLessReviews}
                          className="py-2 px-5 rounded-md border border-gray-300 bg-white text-gray-600 font-semibold text-[13px] cursor-pointer"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

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

      {allCategories.map((cat) => (
        <MaidaItems key={cat} category={cat} excludeId={item._id} />
      ))}
    </>
  );
};

export default OrderPage;