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
import { SuccessCheck } from "../Motion/SuccessCheck";
import { digitsOnly, validateAddress } from "../../utils/validation";
import { FiArrowLeft, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { InlineSkeleton } from "../Skeleton/Skeleton";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://dilkushabackend.onrender.com/api";

const DELIVERY_LOCATION_KEY = "cart_delivery_location";

const STEP_DEFINITIONS = [
  { id: 1, label: "Cart", icon: AiOutlineShoppingCart },
  { id: 2, label: "Address", icon: AiOutlineEnvironment },
  { id: 3, label: "Payment", icon: AiOutlineCreditCard },
  { id: 4, label: "Confirm", icon: AiOutlineCheckCircle },
];

const toImageString = (val) => {
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
};

const getItemImage = (item) =>
  toImageString(item.images?.[0]) ||
  toImageString(item.image) ||
  toImageString(item.img) ||
  toImageString(item.product?.images?.[0]) ||
  toImageString(item.product?.image) ||
  "";


const getUnitPrice = (item) => {
  const offer = Number(item.offer);
  const price = Number(item.price);
  if (offer > 0) return offer;
  return price > 0 ? price : 0;
};

// Factorial helper — 1!=1, 2!=2, 3!=6, 4!=24, 5!=120, 6!=720 ...
const factorial = (n) => {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const getDynamicDeliveryFee = (baseFare, productCount) => {
  const count = Math.max(1, productCount);
  const fee = baseFare / factorial(count);
  return fee < 0.5 ? 0 : fee;
};

const reserveStockForOrder = async (items) => {
  const reservable = items.filter((item) => item.productId);
  const succeeded = [];
  const failed = [];

  for (const item of reservable) {
    try {
      await axios.put(`${BASE_URL}/products/${item.productId}/decrement-stock`, {
        quantity: item.quantity,
      });
      succeeded.push(item);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        `${item.title} is out of stock.`;
      failed.push({ ...item, message: msg });
      break; // stop at the first failure — no point reserving the rest
    }
  }

  if (failed.length > 0) {
    // Roll back anything we already decremented for this order attempt
    await Promise.allSettled(
      succeeded.map((item) =>
        axios.put(`${BASE_URL}/products/${item.productId}/increment-stock`, {
          quantity: item.quantity,
        })
      )
    );
    return { ok: false, failed };
  }

  return { ok: true, reserved: succeeded };
};

// 🆕 Undo a successful reservation — used if order creation fails AFTER
// stock was already decremented (e.g. Razorpay verify step throws).
const rollbackReservedStock = async (items) => {
  await Promise.allSettled(
    items
      .filter((item) => item.productId)
      .map((item) =>
        axios.put(`${BASE_URL}/products/${item.productId}/increment-stock`, {
          quantity: item.quantity,
        })
      )
  );
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
  // 🆕 Pulling in updateQty / removeFromCart too, so Step 1 can offer the
  // same +/- quantity controls and remove button as the Cart page, instead
  // of just showing a read-only quantity.
  const { cartItems, clearCart, updateQty, removeFromCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  // each step (and the success screen) starts at the top of the page
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // 🆕 Tracks any item thumbnails that fail to load, same as Cart.jsx, so we
  // can fall back to a placeholder icon instead of a broken image.
  const [brokenImages, setBrokenImages] = useState({});
  const markImageBroken = (key) =>
    setBrokenImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

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

  // 🆕 Delivery Fee States — baseFare is the raw distance-based amount from
  // the backend; deliveryFee is what actually gets charged, after the
  // divide-by-factorial formula is applied on top of baseFare.
  const [baseFare, setBaseFare] = useState(50); // distance-based, replaces the old static 49
  const [deliveryFee, setDeliveryFee] = useState(50);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [detectedAreaName, setDetectedAreaName] = useState("");
  // 🆕 Where the current delivery fee's location came from — mirrors the
  // Cart page's deliverySource pattern so the customer always knows why the
  // fee is what it is: "estimate" (nothing set yet), "saved-address"
  // (picked from the dropdown / prefilled from account), "gps" (detected
  // via geolocation, here or handed off from the Cart page), or "manual"
  // (customer typed the address fields themselves).
  const [deliverySource, setDeliverySource] = useState("estimate");

  // Computed locally from cartItems using getUnitPrice, instead of trusting
  // a separate CartContext `totals.subtotal` that could disagree with what's
  // actually rendered per line item below (and with the order payload).
  // Because this reads straight from cartItems, editing quantity or removing
  // an item on Step 1 recalculates this automatically — no extra wiring.
  const subtotal = useMemo(
    () => (cartItems || []).reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0),
    [cartItems]
  );

  // 🆕 Total product count = sum of quantities — this is "n" in fee(n) = base/n!
  const productCount = useMemo(
    () => (cartItems || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems]
  );

  // 🆕 Recompute the final delivery fee whenever baseFare or productCount
  // changes — this is what keeps the fee "distance-based, not static", and
  // also what makes it react live to +/- quantity changes on Step 1.
  useEffect(() => {
    setDeliveryFee(getDynamicDeliveryFee(baseFare, productCount));
  }, [baseFare, productCount]);

  // Fetch the distance-based BASE fare from backend (before the
  // divide-by-factorial formula is applied on top of it here).
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
        // 🆕 This is the raw distance-based fare — NOT the final charged
        // amount. The divide-by-factorial formula runs on top of it via
        // the useEffect above.
        setBaseFare(Number(res.data.deliveryFee) || 50);
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

  // 🆕 If the customer already tapped "Detect my location" on the Cart page,
  // pick that up here so they don't have to detect it a second time. Only
  // used to prefill — the customer can still edit the address fields.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DELIVERY_LOCATION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      // Ignore stale detections older than ~30 minutes.
      if (!saved?.detectedAt || Date.now() - saved.detectedAt > 30 * 60 * 1000) return;

      if (saved.coords) setUserCoords(saved.coords);

      if (saved.address) {
        setAddress((prev) => ({
          ...prev,
          street: saved.address.street || prev.street,
          city: saved.address.city || prev.city,
          state: saved.address.state || prev.state,
          pincode: saved.address.pincode || prev.pincode,
        }));
        if (saved.address.street || saved.address.city) {
          setDetectedAreaName(
            [saved.address.street, saved.address.city].filter(Boolean).join(", ")
          );
        }
      }

      if (saved.coords) {
        fetchDeliveryFee(address, saved.coords);
      }
    } catch (err) {
      console.warn("Could not read handed-off location:", err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  // Grand Total = food + delivery (what the customer pays, always in full)
  const grandTotal = foodTotal + deliveryFee;
  // 🆕 One payment, no split: card/UPI now charge the FULL grand total
  // (food + dynamic delivery fee) online, in one go. Nothing is collected
  // separately by the delivery partner anymore.
  const onlinePayable = grandTotal;
  // COD: everything is paid to the driver on delivery (unchanged — this is
  // still a single payment, just made in person instead of online).
  const payableTotal = paymentMethod === "cod" ? grandTotal : onlinePayable;

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

  // address checks: errors show once a field is left (or on "Continue")
  const [addrTouched, setAddrTouched] = useState({});
  const addressErrors = useMemo(() => validateAddress(address, { withContact: true }), [address]);
  const isAddressValid = () => Object.keys(addressErrors).length === 0;
  const addrError = (key) => (addrTouched[key] ? addressErrors[key] : "");

  const ADDRESS_SANITIZE = {
    phone: (v) => digitsOnly(v, 10),
    pincode: (v) => digitsOnly(v, 6),
  };

  const addrField = (key) => ({
    id: `addr-${key}`,
    value: address[key] || "",
    onChange: (e) => {
      const clean = ADDRESS_SANITIZE[key] ? ADDRESS_SANITIZE[key](e.target.value) : e.target.value;
      setAddress({ ...address, [key]: clean });
    },
    onBlur: () => setAddrTouched((t) => ({ ...t, [key]: true })),
    className: addrError(key) ? "is-invalid" : undefined,
    "aria-invalid": addrError(key) ? true : undefined,
    "aria-describedby": addrError(key) ? `addr-${key}-error` : undefined,
  });

  const renderAddrError = (field) =>
    addrError(field) ? (
      <small id={`addr-${field}-error`} className="field-error" role="alert">
        {addrError(field)}
      </small>
    ) : null;

  const goToPayment = () => {
    if (!isAddressValid()) {
      // show every problem and jump to the first one
      setAddrTouched({ name: true, phone: true, street: true, city: true, state: true, pincode: true });
      const first = ["name", "phone", "street", "city", "state", "pincode"].find((k) => addressErrors[k]);
      document.getElementById(`addr-${first}`)?.focus();
      return;
    }
    setStep(3);
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
        image: getItemImage(item), // ✅ always a string now
        price: getUnitPrice(item),
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
    // Send grand total = food + delivery to backend
    total: grandTotal,
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

    // 🆕 Charge the full grand total (food + delivery) online in one shot.
    const createRes = await axios.post(
      `${BASE_URL}/orders/create-razorpay-order`,
      {
        amount: onlinePayable,
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
        name: "Dilkusha Biryani",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        theme: { color: "#b3121b" }, // site chilli, so the Razorpay sheet matches

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

    // 🆕 Build the same items shape used in buildOrderPayload, so productId
    // matches exactly what will be sent to the order API.
    const orderItems = cartItems.map((item) => {
      const rawId =
        item.productId || item._id || item.id || item.product?._id || item.product;
      const isValidMongoId = typeof rawId === "string" && /^[0-9a-fA-F]{24}$/.test(rawId);
      return {
        productId: isValidMongoId ? rawId : null,
        title: item.title || item.name,
        quantity: Number(item.quantity || 1),
      };
    });

    // 🆕 STEP 1 — reserve stock before touching payment/order APIs at all.
    const reservation = await reserveStockForOrder(orderItems);
    if (!reservation.ok) {
      setPlacing(false);
      const names = reservation.failed.map((f) => f.message).join("\n");
      alert(`Some items are no longer available:\n\n${names}\n\nPlease update your cart.`);
      setOrderError("One or more items went out of stock. Please review your cart.");
      return;
    }

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
        try {
          localStorage.removeItem(DELIVERY_LOCATION_KEY);
        } catch (err) {
          // non-fatal
        }
        setStep(4);
      } else {
        // 🆕 Order API itself said no — give the stock back
        await rollbackReservedStock(orderItems);
        setOrderError(result.message || "Failed to place order.");
      }
    } catch (err) {
      // 🆕 Any thrown error (network, Razorpay cancel, verify failure) —
      // give the stock back so it isn't stuck decremented.
      await rollbackReservedStock(orderItems);
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
    <div className="checkout-container" data-no-reveal>
      {ProgressBar()}
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

          {cartItems.length === 0 ? (
            <div className="cart-item" style={{ justifyContent: "center", padding: "24px 0" }}>
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>Your cart is empty.</p>
            </div>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => {
                const unitPrice = getUnitPrice(item);
                const itemKey = item.key || item._id;
                const imgSrc = getItemImage(item);
                const showImage = imgSrc && !brokenImages[itemKey];
                return (
                  <div key={itemKey} className="cart-item">
                    {showImage ? (
                      <img
                        src={imgSrc}
                        alt={item.title}
                        className="cart-item__thumb"
                        onError={() => markImageBroken(itemKey)}
                      />
                    ) : (
                      <div
                        className="cart-item__thumb"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f3f4f6",
                          color: "#9ca3af",
                        }}
                      >
                        <FiShoppingBag />
                      </div>
                    )}

                    <div className="cart-item__info">
                      <p className="cart-item__title">{item.title}</p>

                      {/* 🆕 Editable quantity control — same +/- pattern as
                          Cart.jsx. Any change here flows straight into
                          subtotal → delivery fee → grand total below since
                          they're all derived from cartItems. */}
                      <div
                        className="quantity-control"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "6px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQty(itemKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(itemKey, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div className="cart-item__price">₹ {(unitPrice * item.quantity).toFixed(2)}</div>

                      {/* 🆕 Remove item — same as Cart.jsx's remove button */}
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFromCart(itemKey)}
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
          )}

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
            <label htmlFor="addr-name">Full Name</label>
            <input type="text" autoComplete="name" placeholder="Recipient's Full Name" {...addrField("name")} />
            {renderAddrError("name")}
          </div>

          <div className="form-group">
            <label htmlFor="addr-phone">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit mobile number"
              maxLength={10}
              {...addrField("phone")}
            />
            {renderAddrError("phone")}
          </div>

          <div className="form-group">
            <label htmlFor="addr-street">Street Address</label>
            <input type="text" autoComplete="address-line1" placeholder="House number and street name" {...addrField("street")} />
            {renderAddrError("street")}
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
              <label htmlFor="addr-city">City</label>
              <input type="text" autoComplete="address-level2" placeholder="City" {...addrField("city")} />
              {renderAddrError("city")}
            </div>
            <div className="form-group">
              <label htmlFor="addr-state">State</label>
              <input type="text" autoComplete="address-level1" placeholder="State" {...addrField("state")} />
              {renderAddrError("state")}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="addr-pincode">Postal Code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="6-digit pincode"
                maxLength={6}
                {...addrField("pincode")}
              />
              {renderAddrError("pincode")}
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

            {paymentMethod === "cod" && (
              <div className="payment-note payment-note--warning">
                <p>💵 Cash on Delivery (Pay on Arrival)</p>
                <p>
                  Pay Grand Total (₹{grandTotal.toFixed(2)}) directly to the delivery partner —
                  that includes Food ₹{foodTotal.toFixed(2)} + Delivery ₹{deliveryFee.toFixed(2)}.
                </p>
              </div>
            )}

            {(paymentMethod === "card" || paymentMethod === "upi") && (
              <div className="payment-note payment-note--success">
                <p>💳 Pay Online Now: ₹{onlinePayable.toFixed(2)}</p>
                <p>
                  One single payment — Food ₹{foodTotal.toFixed(2)} + Delivery ₹{deliveryFee.toFixed(2)}
                  {" "}are both included. Nothing more to pay on arrival.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="checkout-left success-screen">
          <div className="success-icon-wrapper">
            <SuccessCheck size={108} label="Order placed" />
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
            <div className="order-detail-row">
              <span>📦 Food Total</span>
              <strong>₹{Number(orderDetails?.subtotal ?? subtotal).toFixed(2)}</strong>
            </div>
            <div className="order-detail-row" style={{ borderTop: '1px dashed var(--sesame)', paddingTop: '12px', marginTop: '4px' }}>
              <span style={{ fontWeight: 700 }}>
                {(orderDetails?.paymentMethod || paymentMethod) === "cod"
                  ? "💰 Grand Total (COD - Pay to Driver)"
                  : "💰 Grand Total"}
              </span>
              <strong className="amount-highlight">
                ₹{Number(
                  orderDetails
                    ? Number(orderDetails.subtotal || 0) + Number(orderDetails.delivery || 0) - Number(orderDetails.discount || 0)
                    : grandTotal
                ).toFixed(2)}
              </strong>
            </div>
            {(orderDetails?.paymentMethod || paymentMethod) !== "cod" && (
              <div className="order-detail-row" style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                <span>✅ Paid Online (Food + Delivery)</span>
                <span>₹{Number(orderDetails?.total ?? onlinePayable).toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="success-actions">
            <button type="button" className="primary-btn" onClick={() => navigate("/orders")}>
              View My Orders
            </button>
            <button type="button" className="secondary-btns" onClick={() => navigate("/")}>
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
                {deliveryFee > 0 ? (
                  <span className="delivery-card__amount">
                    {deliveryLoading ? <InlineSkeleton width="4.5em" /> : `₹ ${deliveryFee.toFixed(2)}`}
                  </span>
                ) : (
                  <span className="delivery-card__amount free-delivery-badge">FREE</span>
                )}
              </div>
              <p className="delivery-card__eta">
                ⏱️ Est. {distanceInfo?.duration || "25 mins"} · <strong>Included in your total</strong>
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
              <span className="price-total__label">GRAND TOTAL</span>
              <p className="price-total__sub">
                Food ₹{foodTotal.toFixed(2)} + Delivery ₹{deliveryFee.toFixed(2)}
                {paymentMethod !== "cod" ? " · Paid together online" : " · Paid together on delivery"}
              </p>
            </div>
            <span className="price-total__amount">₹{grandTotal.toFixed(2)}</span>
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
                onClick={goToPayment}
              >
                Continue to Payment
              </button>
            )}

            {step === 3 && (
              <button className="confirm-order-btn" onClick={handlePlaceOrder} disabled={placing}>
                {placing
                  ? <span className="btn-busy"><span className="btn-spinner" aria-hidden="true" /> Processing payment…</span>
                  : paymentMethod === "cod"
                    ? `Place Order — Pay ₹${grandTotal.toFixed(2)} on Delivery`
                    : `Pay ₹${onlinePayable.toFixed(2)} Online`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
