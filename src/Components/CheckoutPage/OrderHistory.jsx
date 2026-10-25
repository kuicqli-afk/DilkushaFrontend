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
const BASE_URL = "https://backend.shyamnamkeenandbakers.online/api";
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

const STATUS_COLORS = {
  Pending: { bg: "#fff3cd", text: "#856404" },
  Confirmed: { bg: "#e0f7ec", text: "#0f7a4f" },
  Preparing: { bg: "#e0f7ec", text: "#0f7a4f" },
  "Out for Delivery": { bg: "#e6f0ff", text: "#004085" },
  Delivered: { bg: "#17b932ff", text: "#ffffffff" },
  Cancelled: { bg: "#fbe9ea", text: "#a51c22" },
};

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Delivery time too long",
  "Found a better price elsewhere",
  "Changed my mind",
  "Other",
];

function OrderTracker({ status }) {
  if (status === "Cancelled") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 16px",
        background: "#fbe9ea",
        borderRadius: "12px",
        color: "#a51c22",
        marginBottom: "20px",
      }}>
        <AiOutlineCloseCircle size={20} />
        <span style={{ fontSize: "13px", fontWeight: 600 }}>This order was cancelled</span>
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "18px 6px 18px" }}>
      {TRACKING_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === TRACKING_STEPS.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: isLast ? "0 0 auto" : "1" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone ? "linear-gradient(135deg, #0CA678, #12B76A)" : "#eef1f0",
                  color: isDone ? "#fff" : "#a9b3ae",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(18,183,106,0.18)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <Icon size={17} />
              </div>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? "#0CA678" : "#aaa",
                  marginTop: "6px",
                  textAlign: "center",
                  maxWidth: "100px",
                }}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                style={{
                  flex: 2,
                  height: "3px",
                  marginTop: "17px",
                  background: idx < currentIndex ? "linear-gradient(90deg, #0CA678, #12B76A)" : "#eef1f0",
                  borderRadius: "2px",
                  transition: "background 0.3s ease",
                }}
              />
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

function OrderCard({ order, onOpenCancel, cancelling }) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
  const canCancel = ["Pending", "Confirmed"].includes(order.status);

  return (
    <div
      style={{
        border: "1px solid #f1e4ec",
        borderRadius: "16px",
        marginBottom: "18px",
        background: "#fff",
        boxShadow: "0 6px 20px rgba(136,5,89,0.06)",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a" }}>{order.orderId}</p>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "3px" }}>
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>

        <span
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            padding: "5px 14px",
            borderRadius: "20px",
            fontSize: "11.5px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {order.status}
        </span>
      </div>

      {/* LIVE TRACKER */}
      <div style={{ padding: "0 20px" }}>
        <OrderTracker status={order.status} />
      </div>

      {/* DRIVER INFORMATION */}
      {order.driverAssigned && order.driver?.driverId ? (
        <div
          style={{
            margin: "0 20px 16px",
            padding: "14px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #f8fbff, #f1f7ff)",
            border: "1px solid #dcecff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* DRIVER PROFILE */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                minWidth: 0,
              }}
            >
              {order.driver.profilePhoto ? (
                <img
                  src={order.driver.profilePhoto}
                  alt={order.driver.name || "Driver"}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "#e6f0ff",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {getDriverInitials(order.driver.name)}
                </div>
              )}

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    flexWrap: "wrap",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#1f2937",
                    }}
                  >
                    {order.driver.name || "Delivery Partner"}
                  </p>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                      padding: "3px 7px",
                      borderRadius: "20px",
                      background: "#fff7df",
                      color: "#b77900",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    <AiFillStar size={11} /> {formatDriverRating(order.driver.rating)}
                  </span>
                </div>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  Your delivery partner
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  {order.driver.vehicle || "Bike"}
                  {order.driver.vehicleMake ? ` · ${order.driver.vehicleMake}` : ""}
                  {order.driver.vehicleModel ? ` ${order.driver.vehicleModel}` : ""}
                </p>
              </div>
            </div>

            {/* CALL BUTTON */}
            {order.driver.phone && (
              <a
                href={`tel:${order.driver.phone}`}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#0CA678",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: "17px",
                  flexShrink: 0,
                }}
                title="Call driver"
              >
                <AiOutlinePhone size={18} />
              </a>
            )}
          </div>

          {/* DRIVER DETAILS */}
          <div
            style={{
              marginTop: "13px",
              paddingTop: "12px",
              borderTop: "1px solid #dcecff",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>
                Vehicle
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#374151", fontWeight: 700 }}>
                {order.driver.vehicle || "Bike"}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>
                Number Plate
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#374151", fontWeight: 800, letterSpacing: "0.4px" }}>
                {order.driver.numberPlate || "Not available"}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>
                Phone
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#374151", fontWeight: 700 }}>
                {order.driver.phone || "Not available"}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>
                Assigned
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#374151", fontWeight: 700 }}>
                {formatDriverAcceptedAt(order.driver.acceptedAt)}
              </p>
            </div>
          </div>

          {/* DELIVERY STATUS */}
          <div
            style={{
              marginTop: "12px",
              padding: "8px 10px",
              borderRadius: "9px",
              background: "#e8f8f1",
              color: "#0f7a4f",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaMotorcycle size={15} /> {order.deliveryStatus || "Driver assigned"}
          </div>
        </div>
      ) : (
        !["Delivered", "Cancelled"].includes(order.status) && (
          <div
            style={{
              margin: "0 20px 16px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#fff9ed",
              border: "1px solid #f5dfb0",
              color: "#8a6500",
              fontSize: "11.5px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FaMotorcycle size={15} /> We're finding a delivery partner for your order.
          </div>
        )
      )}

      {/* ITEMS SUMMARY (collapsed) */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          padding: "14px 20px",
          borderTop: "1px solid #f4eaf0",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AiOutlineShoppingCart size={15} color="var(--chilli)" />
          <span style={{ fontSize: "12.5px", color: "#666", fontWeight: 500 }}>
            {order.items.length} item{order.items.length > 1 ? "s" : ""}
          </span>
        </div>
        <span style={{ fontSize: "11px", color: "var(--chilli)", fontWeight: 600 }}>
          {expanded ? "Hide details ▲" : "View details ▼"}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 16px" }}>
          {order.items.map((item, idx) => (
            <div
              key={idx}
              style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", color: "#444" }}
            >
              <span>{item.title} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>₹ {item.price * item.quantity}</span>
            </div>
          ))}

          <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed #e5d3de", fontSize: "12px", color: "#888" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <AiOutlineInbox size={14} color="#666" /> Food Subtotal
              </span>
              <span style={{ fontWeight: 600, color: '#444' }}>₹ {Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <FaMotorcycle size={14} color="#666" /> Delivery Fee
              </span>
              <span style={{ fontWeight: 600, color: '#444' }}>₹ {Number(order.delivery || 0).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <AiOutlineTag size={14} color="#16a34a" /> Coupon Discount
                </span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>- ₹ {Number(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingTop: "6px", borderTop: "1.5px solid #e5d3de" }}>
              <span style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '13px', display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <AiOutlineWallet size={15} color="var(--chilli)" /> Grand Total
              </span>
              <span style={{ fontWeight: 700, color: 'var(--chilli)', fontSize: '14px' }}>₹ {(Number(order.subtotal || 0) + Number(order.delivery || 0) - Number(order.discount || 0)).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#888" }}>
            <p><strong style={{ color: "#333" }}>Delivering to:</strong> {order.address?.name}, {order.address?.street}, {order.address?.city} - {order.address?.pincode}</p>
            <p style={{ marginTop: "4px" }}>
              <strong style={{ color: "#333" }}>Payment:</strong> {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
            </p>
          </div>

          {/* Cancel Reason Display */}
          {order.status === "Cancelled" && order.cancelReason && (
            <div style={{
              marginTop: "10px",
              padding: "10px 14px",
              background: "#fbe9ea",
              borderRadius: "10px",
              fontSize: "12px",
              color: "#a51c22",
            }}>
              <strong>Cancel reason:</strong> {order.cancelReason}
              {order.cancelledBy && (
                <span style={{ marginLeft: "6px", color: "#c4747a" }}>
                  ({order.cancelledBy === "admin" ? "Cancelled by restaurant" : "Cancelled by you"})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid #f4eaf0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fbf6f9",
        }}
      >
        <p style={{ fontWeight: 700, fontSize: "15px", color: "var(--chilli)" }}>
          Grand Total: ₹ {(Number(order.subtotal || 0) + Number(order.delivery || 0) - Number(order.discount || 0)).toFixed(2)}
        </p>

        {canCancel && (
          <button
            onClick={() => onOpenCancel(order.orderId)}
            disabled={cancelling}
            style={{
              padding: "7px 18px",
              borderRadius: "18px",
              border: "1.5px solid #e11c1c",
              background: "#fff",
              color: "#e11c1c",
              fontSize: "12px",
              fontWeight: 700,
              cursor: cancelling ? "not-allowed" : "pointer",
              opacity: cancelling ? 0.6 : 1,
            }}
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
      <div style={{ padding: "60px", textAlign: "center" }}>
        <p style={{ color: "#888", fontSize: "13px" }}>{error}</p>
        <button onClick={() => fetchOrders()} style={{ marginTop: "12px" }}>Retry</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: "119px", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", color: "#333" }}>No Orders Found</h2>
        <p style={{ fontSize: "13px", color: "#999", marginTop: "6px" }}>
          Looks like you haven't placed an order yet.
        </p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "18px", padding: "10px 24px", borderRadius: "22px",
            border: "none", background: "linear-gradient(135deg, var(--chilli), var(--chilli-deep))",
            color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer",
          }}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a", fontFamily: "'Montserrat', sans-serif" }}>
            Order History
          </h2>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
            {orders.length} order{orders.length > 1 ? "s" : ""} · live status updates every 15s
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "20px",
            border: "1px solid #e5d3de", background: "#fff",
            color: "var(--chilli)", fontSize: "12px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <AiOutlineReload style={{ animation: refreshing ? "spin 0.6s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onOpenCancel={openCancelModal}
          cancelling={cancellingId === order.orderId}
        />
      ))}

      {cancelModalOrderId && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "20px",
          }}
          onClick={() => setCancelModalOrderId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "16px", padding: "24px",
              maxWidth: "380px", width: "100%",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", marginBottom: "6px" }}>
              Cancel this order?
            </h3>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
              Please tell us why — this helps us improve.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "9px 12px", borderRadius: "10px",
                    border: cancelReasonInput === r ? "1.5px solid var(--chilli)" : "1px solid #eee",
                    background: cancelReasonInput === r ? "#fbeef4" : "#fff",
                    cursor: "pointer", fontSize: "12.5px", color: "#333",
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReasonInput === r}
                    onChange={() => setCancelReasonInput(r)}
                    style={{ accentColor: "var(--chilli)" }}
                  />
                  {r}
                </label>
              ))}

              {cancelReasonInput === "Other" && (
                <textarea
                  placeholder="Please specify..."
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  style={{
                    padding: "10px", borderRadius: "10px", border: "1px solid #eee",
                    fontSize: "12.5px", resize: "none", minHeight: "60px",
                  }}
                />
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setCancelModalOrderId(null)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "20px",
                  border: "1px solid #ddd", background: "#fff", color: "#666",
                  fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                }}
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancellingId === cancelModalOrderId}
                style={{
                  flex: 1, padding: "10px", borderRadius: "20px",
                  border: "none", background: "#e11c1c", color: "#fff",
                  fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
                  opacity: cancellingId === cancelModalOrderId ? 0.6 : 1,
                }}
              >
                {cancellingId === cancelModalOrderId ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}