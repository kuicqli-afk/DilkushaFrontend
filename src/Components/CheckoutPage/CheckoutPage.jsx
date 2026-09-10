import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import {
  AiOutlineTag,
  AiOutlineCheck,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineShoppingCart,
  AiOutlineEnvironment,
  AiOutlineCreditCard,
  AiOutlineCheckCircle,
  AiOutlineMobile,
  AiOutlineWallet,
} from "react-icons/ai";
import "./CheckoutPage.css";
import { FiArrowLeft } from "react-icons/fi";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://shyamfoodbackend.onrender.com/api";

const STEP_DEFINITIONS = [
  { id: 1, label: "Cart", icon: AiOutlineShoppingCart },
  { id: 2, label: "Address", icon: AiOutlineEnvironment },
  { id: 3, label: "Payment", icon: AiOutlineCreditCard },
  { id: 4, label: "Confirm", icon: AiOutlineCheckCircle },
];

// 🆕 SINGLE source of truth for "what the customer actually pays per unit".
// Same helper used on the Cart page — falls back to item.price only if no
// offer price exists. Every price on this page (the Step-1 line items, the
// subtotal, the coupon discount, and the order payload sent to the backend)
// now runs through this one function instead of mixing .price and .offer.
const getUnitPrice = (item) => {
  const offer = Number(item.offer);
  const price = Number(item.price);
  if (offer > 0) return offer;
  return price > 0 ? price : 0;
};

const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = "guest_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Address State
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderDetails, setOrderDetails] = useState(null);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Available Coupons List State
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const [, setFetchingCoupons] = useState(false);

  // Delivery Fee States
  const [deliveryFee, setDeliveryFee] = useState(49);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [detectedAreaName, setDetectedAreaName] = useState("");

  // 🆕 Computed locally from cartItems using getUnitPrice, instead of trusting
  // a separate CartContext `totals.subtotal` that could disagree with what's
  // actually rendered per line item below (and with the order payload).
  const subtotal = useMemo(
    () => (cartItems || []).reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0),
    [cartItems]
  );

  // Fetch Delivery Fee from backend
  const fetchDeliveryFee = async (targetAddress, coords = null) => {
    const addr = targetAddress || address;
    const currentCoords = coords || userCoords;

    const fullAddr = [addr.street, addr.apartment, addr.city, addr.state, addr.pincode]
      .filter(Boolean)
      .join(", ");

    if (!fullAddr && !currentCoords) return;

    setDeliveryLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/orders/calculate-delivery-fee`, {
        address: fullAddr,
        lat: currentCoords?.lat || null,
        lng: currentCoords?.lng || null,
      });

      if (res.data?.success) {
        setDeliveryFee(Number(res.data.deliveryFee) || 49);
        setDistanceInfo({
          distanceKm: res.data.distanceKm,
          duration: res.data.durationText || "25 mins",
        });
      }
    } catch (err) {
      console.warn("Delivery fee calculation fallback:", err.message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Auto calculate when step is 2/3 or address / coordinates change
  useEffect(() => {
    const hasAddress =
      (address.street && address.street.trim().length >= 3) ||
      (address.city && address.city.trim().length >= 3) ||
      (address.pincode && address.pincode.trim().length >= 4) ||
      userCoords;

    if (hasAddress) {
      const debounceTimer = setTimeout(() => {
        fetchDeliveryFee(address, userCoords);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [address.street, address.city, address.pincode, userCoords]);

  // Request user current GPS location, reverse-geocode and auto-fill address form
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);

        // Reverse-geocode to auto-populate form fields
        try {
          const revRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
            { timeout: 4000 }
          );
          if (revRes.data && revRes.data.address) {
            const rawAddr = revRes.data.address;
            const area = rawAddr.suburb || rawAddr.neighbourhood || rawAddr.road || rawAddr.residential || "";
            const city = rawAddr.city || rawAddr.town || rawAddr.county || "Lucknow";
            const state = rawAddr.state || "Uttar Pradesh";
            const pincode = rawAddr.postcode || "";

            setAddress((prev) => ({
              ...prev,
              street: area || prev.street,
              city: city || prev.city,
              state: state || prev.state,
              pincode: pincode || prev.pincode,
            }));

            if (area) {
              setDetectedAreaName(`${area}, ${city}`);
            }
          }
        } catch (revErr) {
          console.warn("Reverse geocode fallback:", revErr.message);
        } finally {
          setDetectingLocation(false);
        }

        fetchDeliveryFee(address, coords);
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err.message);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 1. Fetch available active coupons on mount
  useEffect(() => {
    const fetchActiveCoupons = async () => {
      setFetchingCoupons(true);
      try {
        const res = await axios.get(`${BASE_URL}/coupons`);
        const data = res.data;
        let list = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.coupons)) list = data.coupons;
        else if (Array.isArray(data?.data)) list = data.data;

        // Filter active & non-expired coupons
        const now = new Date().setHours(0, 0, 0, 0);
        const validCoupons = list.filter((c) => {
          if (!c.isActive) return false;
          if (c.expiryDate && new Date(c.expiryDate) < now) return false;
          return true;
        });

        setAvailableCoupons(validCoupons);
      } catch (err) {
        console.error("Error fetching coupons for checkout:", err);
      } finally {
        setFetchingCoupons(false);
      }
    };

    fetchActiveCoupons();
  }, []);

  // 2. Pre-fill default user address
  useEffect(() => {
    if (user) {
      const userAddresses = user.addresses || [];
      const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0] || {};

      setAddress((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        street: defaultAddr.street || prev.street,
        city: defaultAddr.city || prev.city,
        state: defaultAddr.state || prev.state,
        pincode: defaultAddr.pincode || prev.pincode,
      }));
    }
  }, [user]);

  // Calculate discount based on applied coupon
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    let discount = 0;
    if (appliedCoupon.discountType === "percentage") {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discount = appliedCoupon.discountValue || 0;
    }

    return Math.min(discount, subtotal);
  };

  const discount = calculateDiscount();
  const foodTotal = Math.max(0, subtotal - discount);
  const total = foodTotal; // Online Razorpay charges Food Total only
  // 🆕 What the customer's final bill actually is, per payment method — COD
  // pays food + delivery together (nothing paid online), card/upi only pays
  // food total online and settles delivery with the driver in cash/UPI.
  const payableTotal = paymentMethod === "cod" ? foodTotal + deliveryFee : foodTotal;

  // Apply Coupon (by Code string or Coupon Object)
  const applyCouponHandler = async (codeToApply) => {
    const targetCode = codeToApply || couponCode;
    if (!targetCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/coupons/validate`,
        { code: targetCode, cartTotal: subtotal },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (res.data?.success || res.data?.coupon) {
        setAppliedCoupon(res.data.coupon || res.data);
        setCouponCode(targetCode);
        setCouponError("");
        setShowCouponList(false); // close dropdown after selection
      } else {
        setCouponError(res.data?.message || "Invalid coupon code");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      setCouponError(
        err.response?.data?.message || "Failed to apply coupon. Code may be invalid or expired."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleStepClick = (clickedStep) => {
    if (step === 4) return;
    if (clickedStep <= step) setStep(clickedStep);
  };

  const isAddressValid = () => {
    return Boolean(
      address.name && address.phone && address.street && address.city && address.pincode
    );
  };

  const buildOrderPayload = (guestId) => ({
    guestId,
    items: cartItems.map((item) => {
      const rawId =
        item.productId ||
        item._id ||
        item.id ||
        item.product?._id ||
        item.product;

      const isValidMongoId =
        typeof rawId === "string" && /^[0-9a-fA-F]{24}$/.test(rawId);

      return {
        productId: isValidMongoId ? rawId : null,
        title: item.title || item.name,
        image: item.image || item.images?.[0] || "",
        price: getUnitPrice(item), // 🆕 same helper used everywhere else on this page
        quantity: Number(item.quantity || 1),
      };
    }),
    address,
    dropLocation: {
      address: [address.street, address.apartment, address.city, address.pincode].filter(Boolean).join(", "),
      lat: userCoords?.lat || null,
      lng: userCoords?.lng || null,
    },
    paymentMethod,
    subtotal: subtotal,
    delivery: deliveryFee,
    discount: discount,
    total: foodTotal,
    deliveryPayToDriver: true,
    couponCode: appliedCoupon?.code || null,
  });

  const handleCodOrder = async (token, guestId) => {
    const res = await axios.post(
      `${BASE_URL}/orders/place`,
      buildOrderPayload(guestId),
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return res.data;
  };

  const handleRazorpayOrder = async (token, guestId) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Check your internet connection.");
    }

    const payload = buildOrderPayload(guestId);

    const createRes = await axios.post(
      `${BASE_URL}/orders/create-razorpay-order`,
      {
        amount: total,
        guestId,
        paymentMethod,
        items: payload.items,
      },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );

    if (!createRes.data.success) {
      throw new Error(createRes.data.message || "Could not initialize payment.");
    }

    const { order: razorpayOrder, keyId } = createRes.data;

    return new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "ShyamBakers",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        theme: { color: "#880559" },

        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${BASE_URL}/orders/verify-and-place`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...buildOrderPayload(guestId),
              },
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            resolve(verifyRes.data);
          } catch (err) {
            reject(err);
          }
        },

        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user."));
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        reject(new Error(response.error?.description || "Payment failed."));
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return;

    setPlacing(true);
    setOrderError("");

    try {
      const guestId = getGuestId();
      const token = localStorage.getItem("token");

      let result;

      if (paymentMethod === "cod") {
        result = await handleCodOrder(token, guestId);
      } else {
        result = await handleRazorpayOrder(token, guestId);
      }

      if (result.success) {
        setOrderDetails(result.data);
        clearCart();
        setStep(4);
      } else {
        setOrderError(result.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Place Order Error:", err);
      setOrderError(
        err.response?.data?.message || err.message || "Failed to place order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  const ProgressBar = () => (
    <div className="progress-bar">
      {STEP_DEFINITIONS.map((s, idx) => {
        const isComplete = step > s.id;
        const isActive = step === s.id;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.id}>
            <button
              type="button"
              className={`progress-bar__step ${isActive ? "is-active" : ""} ${isComplete ? "is-complete" : ""}`}
              onClick={() => handleStepClick(s.id)}
            >
              <span className="progress-bar__icon">
                {isComplete ? <AiOutlineCheck /> : <Icon />}
              </span>
              <span className="progress-bar__label">{s.label}</span>
            </button>
            {idx < STEP_DEFINITIONS.length - 1 && (
              <span className={`progress-bar__connector ${step > s.id ? "is-complete" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="checkout-container">


      <ProgressBar />


      {step === 1 && (

        <div className="checkout-left">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft />
          </button>

          <div className="panel-header">

            <h2 className="panel-title">Your cart</h2>
            <span className="panel-count">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="cart-list">
            {cartItems.map((item) => {
              // 🆕 same price used here as everywhere else on this page
              const unitPrice = getUnitPrice(item);
              return (
                <div key={item.key || item._id} className="cart-item">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="cart-item__thumb" />
                  )}
                  <div className="cart-item__info">
                    <p className="cart-item__title">{item.title}</p>
                    <p className="cart-item__qty">Quantity: (x{item.quantity})</p>
                  </div>
                  <div className="cart-item__price">₹ {(unitPrice * item.quantity).toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <div className="cart-subtotal">
            <span>Total</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="checkout-left">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Shipping address</h2>
              {detectedAreaName && (
                <p className="panel-subtitle panel-subtitle--success">
                  <AiOutlineCheck /> Auto-filled: {detectedAreaName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingLocation}
              className={`gps-button ${detectingLocation ? "is-loading" : ""}`}
            >
              <AiOutlineEnvironment />
              {detectingLocation
                ? "Detecting GPS…"
                : userCoords
                  ? "Location auto-filled"
                  : "Auto-detect location"}
            </button>
          </div>

          {user?.addresses && user.addresses.length > 1 && (
            <div className="form-group">
              <label>Select saved address</label>
              <select
                className="saved-address-select"
                onChange={(e) => {
                  const selected = user.addresses[e.target.value];
                  if (selected) {
                    setAddress((prev) => ({
                      ...prev,
                      street: selected.street || "",
                      city: selected.city || "",
                      state: selected.state || "",
                      pincode: selected.pincode || "",
                    }));
                  }
                }}
              >
                {user.addresses.map((addr, idx) => (
                  <option key={addr._id || idx} value={idx}>
                    {addr.isDefault ? "[Default] " : ""}
                    {addr.street ? `${addr.street}, ${addr.city}` : `Address #${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Recipient's Full Name"
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              placeholder="House number and street name"
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Apartment, Suite, Unit (Optional)</label>
            <input
              type="text"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={address.apartment || ""}
              onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                placeholder="State"
                value={address.state || ""}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                placeholder="Postal Code"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                placeholder="Country"
                value={address.country || ""}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="checkout-left">
          <h2 className="panel-title" style={{ paddingBottom: "22px" }}>
            Select payment method
          </h2>

          {orderError && <div className="alert alert--error">{orderError}</div>}

          <div className="payment-methods">
            <div
              className={`payment-option ${paymentMethod === "card" ? "active" : ""}`}
              onClick={() => setPaymentMethod("card")}
            >
              <input type="radio" checked={paymentMethod === "card"} readOnly />
              <span className="payment-option__icon">
                <AiOutlineCreditCard />
              </span>
              <div className="payment-option__body">
                <span className="payment-option__title">Credit / Debit Card</span>
                <span className="payment-option__meta">via Razorpay</span>
              </div>
              <span className="payment-option__radio" />
            </div>

            <div
              className={`payment-option ${paymentMethod === "upi" ? "active" : ""}`}
              onClick={() => setPaymentMethod("upi")}
            >
              <input type="radio" checked={paymentMethod === "upi"} readOnly />
              <span className="payment-option__icon">
                <AiOutlineMobile />
              </span>
              <div className="payment-option__body">
                <span className="payment-option__title">UPI</span>
                <span className="payment-option__meta">via Razorpay</span>
              </div>
              <span className="payment-option__radio" />
            </div>

            {/* <div
              className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <input type="radio" checked={paymentMethod === "cod"} readOnly />
              <span className="payment-option__icon">
                <AiOutlineWallet />
              </span>
              <div className="payment-option__body">
                <span className="payment-option__title">Cash on Delivery</span>
                <span className="payment-option__meta">Pay when it arrives</span>
              </div>
              <span className="payment-option__radio" />
            </div> */}

            {paymentMethod === "cod" && (
              <div className="payment-note payment-note--warning">
                <p>💵 Cash on Delivery (Pay on Arrival)</p>
                <p>
                  Pay Food Total (₹{foodTotal.toFixed(2)}) + Delivery Charge (₹{deliveryFee})
                  directly to the delivery partner when your order arrives.
                </p>
              </div>
            )}

            {(paymentMethod === "card" || paymentMethod === "upi") && (
              <div className="payment-note payment-note--success">
                <p>💳 Pay Food Order Online: ₹{foodTotal.toFixed(2)}</p>
                <p>
                  🛵 Delivery fee (₹{deliveryFee}) will be paid directly to the delivery partner
                  in cash/UPI upon delivery.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="checkout-left success-screen">
          <div className="success-icon-wrapper">
            <div className="success-checkmark">
              <AiOutlineCheck className="check-icon" />
            </div>
          </div>

          <h2>Order Placed Successfully!</h2>
          <p className="success-subtitle">
            Thank you for shopping with us. We've received your order and are processing it.
          </p>

          <div className="order-details-card">
            <div className="order-detail-row">
              <span>Order Reference</span>
              <strong>#{orderDetails?.orderId || orderDetails?._id || "N/A"}</strong>
            </div>
            <div className="order-detail-row">
              <span>Payment Method</span>
              <strong style={{ textTransform: "uppercase" }}>
                {orderDetails?.paymentMethod || paymentMethod}
              </strong>
            </div>
            <div className="order-detail-row">
              <span>🛵 Delivery Fee</span>
              <strong>₹{Number(orderDetails?.delivery ?? deliveryFee).toFixed(2)}</strong>
            </div>
            {/* 🆕 label + amount now reflect what was actually paid vs what's
                still payable to the driver, instead of always showing just
                the online food total (which understated COD orders) */}
            <div className="order-detail-row">
              <span>
                {(orderDetails?.paymentMethod || paymentMethod) === "cod"
                  ? "Total Payable (COD)"
                  : "Amount Paid Online"}
              </span>
              <strong className="amount-highlight">
                ₹{Number(
                  orderDetails
                    ? (orderDetails.paymentMethod === "cod"
                      ? Number(orderDetails.total || 0) + Number(orderDetails.delivery ?? deliveryFee)
                      : orderDetails.total)
                    : payableTotal
                ).toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="success-actions">
            <button className="primary-btn" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
            <button className="secondary-btns" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {step !== 4 && (
        <div className="checkout-right">
          <h3>Your Order</h3>

          <div className="price-row">
            <span>Food Items Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="price-row discount-row">
              <span>Coupon Discount</span>
              <span>- ₹ {discount.toFixed(2)}</span>
            </div>
          )}

          {step >= 2 && (
            <div className="delivery-card">
              <div className="delivery-card__row">
                <span className="delivery-card__label">
                  🛵 Delivery Fee {distanceInfo ? `(${distanceInfo.distanceKm} km)` : ""}
                </span>
                <span className="delivery-card__amount">
                  {deliveryLoading ? "..." : `₹ ${deliveryFee}`}
                </span>
              </div>
              <p className="delivery-card__eta">
                ⏱️ Est. {distanceInfo?.duration || "25 mins"} · <strong>Pay to Driver on Delivery</strong>
              </p>
            </div>
          )}

          <div className="coupon-section">
            {appliedCoupon ? (
              <div className="coupon-applied">
                <div>
                  <span className="coupon-applied__code">
                    <AiOutlineTag /> {appliedCoupon.code}
                  </span>
                  <p className="coupon-applied__note">Coupon applied successfully!</p>
                </div>
                <button onClick={handleRemoveCoupon} className="coupon-remove">
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="coupon-row">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    className="coupon-input"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponLoading}
                  />
                  <button
                    className="apply-coupon-btn"
                    onClick={() => applyCouponHandler()}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>

                {availableCoupons.length > 0 && (
                  <div className="coupon-toggle-wrapper">
                    <button
                      type="button"
                      onClick={() => setShowCouponList((prev) => !prev)}
                      className="coupon-toggle"
                    >
                      <span>
                        <AiOutlineTag /> View Available Coupons ({availableCoupons.length})
                      </span>
                      {showCouponList ? <AiOutlineUp /> : <AiOutlineDown />}
                    </button>

                    {showCouponList && (
                      <div className="coupon-list">
                        {availableCoupons.map((c) => (
                          <div key={c._id || c.code} className="coupon-item">
                            <div>
                              <span className="coupon-item__code">{c.code}</span>
                              <p className="coupon-item__desc">
                                {c.discountType === "percentage"
                                  ? `${c.discountValue}% OFF ${c.maxDiscountAmount ? `(Up to ₹${c.maxDiscountAmount})` : ""
                                  }`
                                  : `₹${c.discountValue} OFF`}
                                {c.minOrderAmount ? ` on orders above ₹${c.minOrderAmount}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => applyCouponHandler(c.code)}
                              disabled={couponLoading}
                              className="coupon-item__apply"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {couponError && <p className="coupon-error">{couponError}</p>}
          </div>

          <hr />

          <div className="price-total">
            <div>
              <span className="price-total__label">
                {paymentMethod === "cod" ? "TOTAL ORDER VALUE" : "PAY NOW (FOOD TOTAL)"}
              </span>
              <p className="price-total__sub">
                {paymentMethod === "cod"
                  ? `Food ₹${foodTotal.toFixed(2)} + Delivery ₹${deliveryFee}`
                  : `Delivery ₹${deliveryFee} to be paid to driver on arrival`}
              </p>
            </div>
            <span className="price-total__amount">₹{payableTotal.toFixed(2)}</span>
          </div>

          <div className="summary-action">
            {step === 1 && (
              <button
                className="confirm-order-btn"
                disabled={cartItems.length === 0}
                onClick={() => setStep(2)}
              >
                Continue to Address
              </button>
            )}

            {step === 2 && (
              <button
                className="confirm-order-btn"
                disabled={!isAddressValid()}
                onClick={() => setStep(3)}
              >
                Continue to Payment
              </button>
            )}

            {step === 3 && (
              <button className="confirm-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                {placing
                  ? "Processing..."
                  : paymentMethod === "cod"
                    ? `Place Order (COD ₹${payableTotal.toFixed(2)})`
                    : `Pay ₹ ${foodTotal.toFixed(2)} Online`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}