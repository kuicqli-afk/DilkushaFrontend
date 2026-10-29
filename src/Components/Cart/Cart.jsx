import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiArrowLeft, FiMapPin } from "react-icons/fi";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Cart.css";
import { optimizeImage } from "../../utils/image";
import { InlineSkeleton } from "../Skeleton/Skeleton";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://dilkushabackend.onrender.com/api";

// Key used to hand the detected location off to the Checkout page so the
// customer doesn't have to detect it twice.
const DELIVERY_LOCATION_KEY = "cart_delivery_location";

// Product images can arrive under different keys depending on where the item
// was added from (images[], image, img, or nested inside `product`). Check
// them all instead of assuming one shape.
const getItemImage = (item) =>
  item.images?.[0] ||
  item.image ||
  item.img ||
  item.product?.images?.[0] ||
  item.product?.image ||
  "";

// SINGLE source of truth for "what a customer actually pays per unit".
// Falls back to item.price only if no offer price exists, so every price
// shown/calculated on this page (unit price, line total, and the summary
// card) always agrees with each other instead of mixing offer vs price.
const getUnitPrice = (item) => {
  const offer = Number(item.offer);
  const price = Number(item.price);
  if (offer > 0) return offer;
  return price > 0 ? price : 0;
};

const getMrpPrice = (item) => Number(item.price) || getUnitPrice(item);

// how long a removed row takes to slide out and close its gap (matches Cart.css)
const LEAVE_MS = 380;

// Factorial helper — 1!=1, 2!=2, 3!=6, 4!=24, 5!=120, 6!=720 ...
const factorial = (n) => {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

// Final delivery fee = distance-based baseFare (real API, not static)
// divided by the factorial of the product count:
// fee(n) = baseFare / n!  →  50, 25, 8.33, 2.08, 0.42, ~0 (free) ...
const getDynamicDeliveryFee = (baseFare, productCount) => {
  const count = Math.max(1, productCount);
  const fee = baseFare / factorial(count);
  return fee < 0.5 ? 0 : fee;
};

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [brokenImages, setBrokenImages] = useState({});
  // rows animating out before they're actually removed from the cart
  const [leaving, setLeaving] = useState({});
  const leaveTimers = useRef([]);

  useEffect(() => () => leaveTimers.current.forEach(clearTimeout), []);

  const removeAnimated = (key) => {
    if (leaving[key]) return;
    setLeaving((prev) => ({ ...prev, [key]: true }));
    leaveTimers.current.push(
      setTimeout(() => {
        removeFromCart(key);
        setLeaving((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, LEAVE_MS)
    );
  };

  const clearAnimated = () => {
    setLeaving(Object.fromEntries((cartItems || []).map((item) => [item.key, true])));
    leaveTimers.current.push(
      setTimeout(() => {
        clearCart();
        setLeaving({});
      }, LEAVE_MS)
    );
  };

  // Real distance-based base fare — same API the Checkout page uses.
  // Stays at a clearly-labelled fallback ONLY until a real address/location
  // is available (saved address, or the customer clicking "Detect location").
  const [baseFare, setBaseFare] = useState(50);
  const [distanceKm, setDistanceKm] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySource, setDeliverySource] = useState("estimate"); // "estimate" | "saved-address" | "gps"

  // 🆕 Click-to-detect location state (mirrors the Checkout page's GPS flow)
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedAreaName, setDetectedAreaName] = useState("");
  const [locationError, setLocationError] = useState("");

  const markImageBroken = (key) =>
    setBrokenImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const fetchRealBaseFare = async (payload, source) => {
    setDeliveryLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/orders/calculate-delivery-fee`, payload);
      if (res.data?.success) {
        setBaseFare(Number(res.data.deliveryFee) || 50);
        setDistanceKm(res.data.distanceKm ?? null);
        setDeliverySource(source);
        return res.data;
      }
    } catch (err) {
      console.warn("Cart delivery fee fetch failed, keeping estimate:", err.message);
    } finally {
      setDeliveryLoading(false);
    }
    return null;
  };

  // On mount: if the user has a saved default address, use it right away —
  // this needs no permission prompt so it's safe to run automatically.
  useEffect(() => {
    const savedAddresses = user?.addresses || [];
    const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

    if (defaultAddr && (defaultAddr.street || defaultAddr.city || defaultAddr.pincode)) {
      const fullAddr = [defaultAddr.street, defaultAddr.city, defaultAddr.state, defaultAddr.pincode]
        .filter(Boolean)
        .join(", ");
      fetchRealBaseFare({ address: fullAddr, lat: null, lng: null }, "saved-address");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 🆕 Click-triggered "Detect my location" — customer taps it, browser asks
  // for GPS permission once, we reverse-geocode it into a readable area name,
  // fetch the real distance-based fare, and hand the location off to
  // Checkout (via localStorage) so it's already filled in there too.
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocationError("");
    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        let areaLabel = "";
        let reverseAddress = { street: "", city: "", state: "", pincode: "" };

        try {
          const revRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
            { timeout: 4000 }
          );
          if (revRes.data && revRes.data.address) {
            const rawAddr = revRes.data.address;
            const area = rawAddr.suburb || rawAddr.neighbourhood || rawAddr.road || rawAddr.residential || "";
            const city = rawAddr.city || rawAddr.town || rawAddr.county || "";
            const state = rawAddr.state || "";
            const pincode = rawAddr.postcode || "";

            reverseAddress = { street: area, city, state, pincode };
            areaLabel = area ? `${area}, ${city || ""}`.replace(/, $/, "") : city;
          }
        } catch (revErr) {
          console.warn("Cart reverse geocode fallback:", revErr.message);
        }

        const result = await fetchRealBaseFare(
          { address: "", lat: coords.lat, lng: coords.lng },
          "gps"
        );

        if (areaLabel) setDetectedAreaName(areaLabel);

        // Hand the detected location off to Checkout so it's pre-filled
        // there and doesn't need to be detected a second time.
        try {
          localStorage.setItem(
            DELIVERY_LOCATION_KEY,
            JSON.stringify({
              coords,
              address: reverseAddress,
              distanceKm: result?.distanceKm ?? null,
              detectedAt: Date.now(),
            })
          );
        } catch (storageErr) {
          console.warn("Could not persist detected location:", storageErr.message);
        }

        setDetectingLocation(false);
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err.message);
        setLocationError("Couldn't access your location. You can still add an address at checkout.");
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // All totals derived from the SAME getUnitPrice/getMrpPrice helpers used
  // for each line item below — this keeps every number on the page
  // (unit price, line totals, and this summary) consistent with each other.
  const summary = useMemo(() => {
    const list = cartItems || [];
    const subtotal = list.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);
    const mrpTotal = list.reduce((sum, item) => sum + getMrpPrice(item) * item.quantity, 0);
    const discount = Math.max(0, mrpTotal - subtotal);

    // Total product count = sum of quantities — this is "n" in fee(n) = base/n!
    const productCount = list.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const deliveryEstimate = getDynamicDeliveryFee(baseFare, productCount);
    // 🆕 Grand total = food + delivery, charged together as ONE payment.
    // There is no more "pay delivery separately on arrival" split — whatever
    // total shows here is exactly what gets paid in one shot at checkout.
    const grandTotal = subtotal + deliveryEstimate;
    return { subtotal, mrpTotal, discount, grandTotal, deliveryEstimate, productCount };
  }, [cartItems, baseFare]);

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirectTo=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  const handleBack = () => {
    // Goes to the previous page in history; falls back to home if there's
    // no history to go back to (e.g. cart opened directly via URL/refresh).
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-empty-container" data-no-reveal>
        <div className="cart-empty-card">
          <div className="empty-icon-wrapper">
            <FiShoppingBag className="empty-icon" />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="continue-btn">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-wrapper" data-no-reveal>
      <div className="cart-header">
        {/* Back button */}
        <button
          type="button"
          className="cart-back-btn"
          onClick={handleBack}
          aria-label="Go back"
        >
          <FiArrowLeft />
        </button>
        <h2>Shopping Cart</h2>
        <span key={cartItems.length} className="item-count">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="cart-grid">
        {/* Left Column: Items List */}
        <div className="cart-items-section">
          <div className="cart-list">
            {cartItems.map((item, index) => {
              const unitPrice = getUnitPrice(item);
              const mrpPrice = getMrpPrice(item);
              const hasDiscount = mrpPrice > unitPrice;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              const imgSrc = getItemImage(item);
              const showImage = imgSrc && !brokenImages[item.key];
              return (
                <div
                  key={item.key}
                  className={`cart-item-slot ${leaving[item.key] ? "is-leaving" : ""}`}
                  style={{ "--i": Math.min(index, 8) }}
                >
                  <div className="cart-item-card">
                    <div className="cart-product-info">
                      <div className="cart-image-wrapper">
                        {showImage ? (
                          <img
                            src={optimizeImage(imgSrc, 240)}
                            alt={item.title}
                            onError={() => markImageBroken(item.key)}
                          />
                        ) : (
                          <div className="cart-image-placeholder">
                            <FiShoppingBag />
                          </div>
                        )}
                      </div>
                      <div className="cart-details">
                        <h4 className="product-title">{item.title}</h4>

                        {/* unit price matches the same price used for the line total */}
                        <div className="unit-price">
                          ₹{unitPrice.toFixed(2)} each
                          {hasDiscount && (
                            <span className="unit-price-mrp">₹{mrpPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="cart-controls">
                      <div className="quantity-control">
                        <button
                          onClick={() => updateQty(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span key={item.quantity} className="cart-tick">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.key, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <div key={itemTotal} className="item-price-total cart-tick">₹{itemTotal}</div>

                      <button
                        className="remove-btn"
                        onClick={() => removeAnimated(item.key)}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer-actions">
            <Link to="/" className="back-link">
              ← Continue Shopping
            </Link>
            <button type="button" className="clear-cart-btn" onClick={clearAnimated}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>

            {/* 🆕 Click-to-detect location button */}
            <button
              type="button"
              className={`cart-gps-button ${detectingLocation ? "is-loading" : ""}`}
              onClick={handleDetectLocation}
              disabled={detectingLocation}
            >
              <FiMapPin />
              {detectingLocation
                ? "Detecting your location…"
                : deliverySource === "gps"
                  ? "Location detected — tap to refresh"
                  : "Current location for Delivery charge"}
            </button>
            {detectedAreaName && deliverySource === "gps" && (
              <p className="cart-gps-button delivery-source-note--ok">
                <FiMapPin size={11} /> {detectedAreaName}
              </p>
            )}
            {locationError && <p className="location-error-text">{locationError}</p>}

            <div className="summary-row">
              <span>Total MRP</span>
              <span className={summary.discount > 0 ? "mrp-strike" : ""}>
                ₹{summary.mrpTotal.toFixed(2)}
              </span>
            </div>

            {summary.discount > 0 && (
              <div className="summary-row summary-discount">
                <span>Discount on MRP</span>
                <span>− ₹{summary.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Subtotal</span>
              <strong key={summary.subtotal} className="cart-tick">₹{summary.subtotal.toFixed(2)}</strong>
            </div>

            {/* Delivery row — driven by the real distance API result, with a
                small source indicator so it's clear where the base fare came
                from (saved address / GPS / not-yet-known estimate) */}
            <div className="summary-row">
              <span>
                🛵 Delivery Fee
                {distanceKm != null && ` (${distanceKm} km)`}
              </span>
              {deliveryLoading ? (
                <InlineSkeleton width="4.5em" />
              ) : summary.deliveryEstimate > 0 ? (
                <span className="delivery-estimate-note">
                  +₹{summary.deliveryEstimate.toFixed(2)}
                </span>
              ) : (
                <span className="free-delivery-badge">FREE</span>
              )}
            </div>

            {deliverySource === "estimate" && (
              <p className="delivery-source-note">
                <FiMapPin size={11} /> Estimate — tap "Detect my location" above for the exact fee
              </p>
            )}
            {deliverySource === "saved-address" && (
              <p className="delivery-source-note delivery-source-note--ok">
                <FiMapPin size={11} /> Based on your saved address
              </p>
            )}

            <hr className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Grand Total</span>
              <strong key={summary.grandTotal} className="cart-tick">₹{summary.grandTotal.toFixed(2)}</strong>
            </div>
            {/* 🆕 One payment, no delivery-on-arrival split: the food total
                and the dynamic delivery charge are paid together, in one go,
                at checkout. */}
            <p className="delivery-note-text">
              Food + delivery are paid together as one amount at checkout — nothing extra to pay on arrival.
            </p>

            <button type="button" className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;