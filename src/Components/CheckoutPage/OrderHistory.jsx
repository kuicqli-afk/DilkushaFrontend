import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineShoppingCart,
  AiOutlineHome,
  AiOutlineCloseCircle,
  AiOutlineReload,
  AiFillStar,
  AiOutlinePhone,
  AiOutlineInbox,
  AiOutlineTag,
  AiOutlineWallet,
} from "react-icons/ai";
import { FaMotorcycle } from "react-icons/fa";
import { OrderListSkeleton } from "../Skeleton/Skeleton";
import "./OrderHistory.css";
const BASE_URL = "http://localhost:5001/api";
const POLL_INTERVAL = 10000;

const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

const TRACKING_STEPS = [
  { key: "Pending", label: "Order Placed", icon: AiOutlineShoppingCart },
  { key: "Confirmed", label: "Confirmed", icon: AiOutlineCheckCircle },
  { key: "Preparing", label: "Preparing", icon: AiOutlineClockCircle },
  { key: "Out for Delivery", label: "Out for Delivery", icon: FaMotorcycle },
  { key: "Delivered", label: "Delivered", icon: AiOutlineHome },
];

const getStepIndex = (status) => {
  const idx = TRACKING_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Delivery time too long",
  "Found a better price elsewhere",
  "Changed my mind",
  "Other",
];

// "Out for Delivery" -> "out-for-delivery", for the status pill colour
const statusSlug = (status = "Pending") => status.toLowerCase().replace(/\s+/g, "-");

const orderTotal = (order) =>
  (Number(order.subtotal || 0) + Number(order.delivery || 0) - Number(order.discount || 0)).toFixed(2);

function OrderTracker({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="oh-cancelled">
        <AiOutlineCloseCircle size={20} />
        <span>This order was cancelled</span>
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div className="oh-tracker">
      {TRACKING_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === TRACKING_STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`oh-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""} ${isLast ? "is-last" : ""}`}
              style={{ "--s": idx }}
            >
              <div className="oh-step-icon">
                <Icon size={17} />
              </div>
              <span className="oh-step-label">{step.label}</span>
            </div>

            {!isLast && (
              <div className={`oh-connector ${idx < currentIndex ? "is-done" : ""}`} style={{ "--s": idx }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const getDriverInitials = (name = "Driver") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const formatDriverRating = (rating) => {
  const value = Number(rating);
  return Number.isFinite(value) ? value.toFixed(1) : "New";
};

const formatDriverAcceptedAt = (date) => {
  if (!date) return "Just now";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function OrderCard({ order, index, onOpenCancel, cancelling }) {
  const [expanded, setExpanded] = useState(false);
  const canCancel = ["Pending", "Confirmed"].includes(order.status);

  return (
    <div className="oh-card" style={{ "--i": Math.min(index, 6) }}>
      {/* HEADER */}
      <div className="oh-card-head">
        <div>
          <p className="oh-order-id">{order.orderId}</p>
          <p className="oh-order-date">
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>

        <span key={order.status} className={`oh-status oh-status--${statusSlug(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* LIVE TRACKER */}
      <div className="oh-pad">
        <OrderTracker status={order.status} />
      </div>

      {/* DRIVER INFORMATION */}
      {order.driverAssigned && order.driver?.driverId ? (
        <div className="oh-driver">
          <div className="oh-driver-top">
            {/* DRIVER PROFILE */}
            <div className="oh-driver-profile">
              {order.driver.profilePhoto ? (
                <img
                  className="oh-driver-photo"
                  src={order.driver.profilePhoto}
                  alt={order.driver.name || "Driver"}
                />
              ) : (
                <div className="oh-driver-photo oh-driver-initials">
                  {getDriverInitials(order.driver.name)}
                </div>
              )}

              <div className="oh-min0">
                <div className="oh-driver-name-row">
                  <p className="oh-driver-name">{order.driver.name || "Delivery Partner"}</p>
                  <span className="oh-driver-rating">
                    <AiFillStar size={11} /> {formatDriverRating(order.driver.rating)}
                  </span>
                </div>
                <p className="oh-driver-sub">Your delivery partner</p>
                <p className="oh-driver-sub">
                  {order.driver.vehicle || "Bike"}
                  {order.driver.vehicleMake ? ` · ${order.driver.vehicleMake}` : ""}
                  {order.driver.vehicleModel ? ` ${order.driver.vehicleModel}` : ""}
                </p>
              </div>
            </div>

            {/* CALL BUTTON */}
            {order.driver.phone && (
              <a href={`tel:${order.driver.phone}`} className="oh-call" title="Call driver" aria-label="Call driver">
                <AiOutlinePhone size={18} />
              </a>
            )}
          </div>

          {/* DRIVER DETAILS */}
          <div className="oh-driver-grid">
            <div>
              <p className="oh-mini-label">Vehicle</p>
              <p className="oh-mini-value">{order.driver.vehicle || "Bike"}</p>
            </div>
            <div>
              <p className="oh-mini-label">Number Plate</p>
              <p className="oh-mini-value oh-plate">{order.driver.numberPlate || "Not available"}</p>
            </div>
            <div>
              <p className="oh-mini-label">Phone</p>
              <p className="oh-mini-value">{order.driver.phone || "Not available"}</p>
            </div>
            <div>
              <p className="oh-mini-label">Assigned</p>
              <p className="oh-mini-value">{formatDriverAcceptedAt(order.driver.acceptedAt)}</p>
            </div>
          </div>

          {/* DELIVERY STATUS */}
          <div className="oh-delivery-status">
            <FaMotorcycle size={15} /> {order.deliveryStatus || "Driver assigned"}
          </div>
        </div>
      ) : (
        !["Delivered", "Cancelled"].includes(order.status) && (
          <div className="oh-finding">
            <FaMotorcycle size={15} className="oh-ride" /> We're finding a delivery partner for your order.
          </div>
        )
      )}

      {/* ITEMS SUMMARY (collapsed) */}
      <button
        type="button"
        className={`oh-toggle ${expanded ? "is-open" : ""}`}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="oh-toggle-count">
          <AiOutlineShoppingCart size={15} />
          {order.items.length} item{order.items.length > 1 ? "s" : ""}
        </span>
        <span className="oh-toggle-label">
          {expanded ? "Hide details" : "View details"} <span className="oh-caret" aria-hidden="true">▾</span>
        </span>
      </button>

      {expanded && (
        <div className="oh-details">
          {order.items.map((item, idx) => (
            <div key={idx} className="oh-item-row">
              <span>{item.title} × {item.quantity}</span>
              <span className="oh-strong">₹ {item.price * item.quantity}</span>
            </div>
          ))}

          <div className="oh-bill">
            <div className="oh-bill-row">
              <span className="oh-inline"><AiOutlineInbox size={14} /> Food Subtotal</span>
              <span className="oh-strong">₹ {Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="oh-bill-row">
              <span className="oh-inline"><FaMotorcycle size={14} /> Delivery Fee</span>
              <span className="oh-strong">₹ {Number(order.delivery || 0).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="oh-bill-row oh-discount">
                <span className="oh-inline"><AiOutlineTag size={14} /> Coupon Discount</span>
                <span className="oh-strong">- ₹ {Number(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="oh-bill-row oh-bill-total">
              <span className="oh-inline"><AiOutlineWallet size={15} /> Grand Total</span>
              <span>₹ {orderTotal(order)}</span>
            </div>
          </div>

          <div className="oh-meta">
            <p><strong>Delivering to:</strong> {order.address?.name}, {order.address?.street}, {order.address?.city} - {order.address?.pincode}</p>
            <p><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}</p>
          </div>

          {/* Cancel Reason Display */}
          {order.status === "Cancelled" && order.cancelReason && (
            <div className="oh-cancel-reason">
              <strong>Cancel reason:</strong> {order.cancelReason}
              {order.cancelledBy && (
                <span className="oh-cancel-by">
                  ({order.cancelledBy === "admin" ? "Cancelled by restaurant" : "Cancelled by you"})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="oh-card-foot">
        <p className="oh-total">Grand Total: ₹ {orderTotal(order)}</p>

        {canCancel && (
          <button
            type="button"
            className="oh-cancel-btn"
            onClick={() => onOpenCancel(order.orderId)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  const fetchOrders = useCallback((silent = false) => {
    const guestId = getGuestId();
    if (!silent) setLoading(true);

    axios
      .get(`${BASE_URL}/orders/my-orders/${guestId}`)
      .then((res) => {
        setOrders(res.data.data || []);
        setError("");
      })
      .catch((err) => {
        console.error("Fetch orders error:", err);
        if (!silent) setError("Could not load your orders.");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  const openCancelModal = (orderId) => {
    setCancelModalOrderId(orderId);
    setCancelReasonInput("");
  };

  const confirmCancel = async () => {
    if (!cancelReasonInput.trim()) {
      alert("Please select or enter a reason.");
      return;
    }

    setCancellingId(cancelModalOrderId);
    try {
      await axios.put(`${BASE_URL}/orders/cancel/${cancelModalOrderId}`, {
        reason: cancelReasonInput.trim(),
        cancelledBy: "customer",
      });
      setCancelModalOrderId(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <OrderListSkeleton />
    );
  }

  if (error) {
    return (
      <div className="oh-empty" data-no-reveal>
        <p>{error}</p>
        <button type="button" className="oh-primary-btn" onClick={() => fetchOrders()}>Retry</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="oh-empty" data-no-reveal>
        <div className="oh-empty-icon">
          <AiOutlineShoppingCart aria-hidden="true" />
        </div>
        <h2>No Orders Found</h2>
        <p>Looks like you haven't placed an order yet.</p>
        <button type="button" className="oh-primary-btn" onClick={() => navigate("/")}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="oh-page" data-no-reveal>
      <div className="oh-header">
        <div>
          <h2>My Orders</h2>
          <p>
            {orders.length} order{orders.length > 1 ? "s" : ""} · live status updates every {POLL_INTERVAL / 1000}s
          </p>
        </div>

        <button
          type="button"
          className={`oh-refresh ${refreshing ? "is-spinning" : ""}`}
          onClick={handleManualRefresh}
          disabled={refreshing}
        >
          <AiOutlineReload />
          Refresh
        </button>
      </div>

      {orders.map((order, index) => (
        <OrderCard
          key={order._id}
          order={order}
          index={index}
          onOpenCancel={openCancelModal}
          cancelling={cancellingId === order.orderId}
        />
      ))}

      {cancelModalOrderId && (
        <div className="oh-modal-backdrop" onClick={() => setCancelModalOrderId(null)}>
          <div
            className="oh-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="oh-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="oh-modal-title">Cancel this order?</h3>
            <p>Please tell us why — this helps us improve.</p>

            <div className="oh-reasons">
              {CANCEL_REASONS.map((r) => (
                <label key={r} className={`oh-reason ${cancelReasonInput === r ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReasonInput === r}
                    onChange={() => setCancelReasonInput(r)}
                  />
                  {r}
                </label>
              ))}

              {cancelReasonInput === "Other" && (
                <textarea
                  className="oh-reason-text"
                  placeholder="Please specify..."
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                />
              )}
            </div>

            <div className="oh-modal-actions">
              <button type="button" className="oh-keep-btn" onClick={() => setCancelModalOrderId(null)}>
                Keep Order
              </button>
              <button
                type="button"
                className="oh-confirm-btn"
                onClick={confirmCancel}
                disabled={cancellingId === cancelModalOrderId}
              >
                {cancellingId === cancelModalOrderId ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
