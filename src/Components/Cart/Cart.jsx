import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
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

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQty, removeFromCart, totals, clearCart } = useCart();
  const [brokenImages, setBrokenImages] = useState({});

  const markImageBroken = (key) =>
    setBrokenImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login?redirectTo=/checkout");
    } else {
      navigate("/checkout");
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
              const itemTotal = Number(item.price * item.quantity).toFixed(2);
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
                      <div className="unit-price">₹{item.price} each</div>
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
              <span>Subtotal</span>
              <strong>₹{Number(totals?.subtotal || 0).toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span className="free-tag">Calculated at checkout</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>₹{Number(totals?.subtotal || 0).toFixed(2)}</strong>
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