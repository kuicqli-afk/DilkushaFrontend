import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useCart } from "../../Context/CartContext";
import "./Cart.css";

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

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart, clearCart } = useCart();
  const [brokenImages, setBrokenImages] = useState({});

  const markImageBroken = (key) =>
    setBrokenImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  // All totals derived from the SAME getUnitPrice/getMrpPrice helpers used
  // for each line item below — this keeps every number on the page
  // (unit price, line totals, and this summary) consistent with each other.
  // 🆕 discount = MRP Total - Subtotal (i.e. the sum of price-vs-offer gaps
  // across every line item). No delivery fee — Total is simply the Subtotal.
  const summary = useMemo(() => {
    const list = cartItems || [];
    const subtotal = list.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);
    const mrpTotal = list.reduce((sum, item) => sum + getMrpPrice(item) * item.quantity, 0);
    const discount = Math.max(0, mrpTotal - subtotal);
    return { subtotal, mrpTotal, discount, grandTotal: subtotal };
  }, [cartItems]);

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
      <div className="cart-empty-container">
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
    <div className="cart-wrapper">
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
        <span className="item-count">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="cart-grid">
        {/* Left Column: Items List */}
        <div className="cart-items-section">
          <div className="cart-list">
            {cartItems.map((item) => {
              const unitPrice = getUnitPrice(item);
              const mrpPrice = getMrpPrice(item);
              const hasDiscount = mrpPrice > unitPrice;
              const itemTotal = (unitPrice * item.quantity).toFixed(2);
              const imgSrc = getItemImage(item);
              const showImage = imgSrc && !brokenImages[item.key];
              return (
                <div key={item.key} className="cart-item-card">
                  <div className="cart-product-info">
                    <div className="cart-image-wrapper">
                      {showImage ? (
                        <img
                          src={imgSrc}
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
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.key, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <div className="item-price-total">₹{itemTotal}</div>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.key)}
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer-actions">
            <Link to="/" className="back-link">
              ← Continue Shopping
            </Link>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>

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
              <strong>₹{summary.subtotal.toFixed(2)}</strong>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>₹{summary.grandTotal.toFixed(2)}</strong>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;