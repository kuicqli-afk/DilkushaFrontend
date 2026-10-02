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
} from "react-icons/ai";
import "./CheckoutPage.css";
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiShoppingBag,
} from "react-icons/fi";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://backend.shyamnamkeenandbakers.online/api";

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

const factorial = (n) => {
  if (n <= 1) return 1;

  let result = 1;

  for (let i = 2; i <= n; i++) {
    result *= i;
  }

  return result;
};

const getDynamicDeliveryFee = (baseFare, productCount) => {
  const count = Math.max(1, productCount);
  const fee = Number(baseFare || 0) / factorial(count);

  return fee < 0.5 ? 0 : fee;
};

const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");

  if (!guestId) {
    guestId =
      "guest_" +
      Date.now() +
      "_" +
      Math.random().toString(36).slice(2, 9);

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

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const isValidProductId = (rawId) => {
  return (
    typeof rawId === "string" &&
    /^[0-9a-fA-F]{24}$/.test(rawId)
  );
};

const getProductId = (item) => {
  const rawId =
    item.productId ||
    item._id ||
    item.id ||
    item.product?._id ||
    item.product;

  return isValidProductId(rawId) ? rawId : null;
};

/*
 * Decrease stock ONLY after the order/payment has successfully completed.
 *
 * This function is intentionally kept separate from Razorpay creation.
 * Payment creation should never consume inventory.
 */
const decrementStockAfterSuccess = async (items) => {
  const reservable = items.filter((item) => item.productId);
  const succeeded = [];
  const failed = [];

  for (const item of reservable) {
    try {
      await axios.put(
        `${BASE_URL}/products/${item.productId}/decrement-stock`,
        {
          quantity: item.quantity,
        }
      );

      succeeded.push(item);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        `${item.title || "Product"} is out of stock.`;

      failed.push({
        ...item,
        message,
      });

      break;
    }
  }

  /*
   * If one product fails after previous products were already decremented,
   * restore the previous successful decrements.
   */
  if (failed.length > 0 && succeeded.length > 0) {
    await Promise.allSettled(
      succeeded.map((item) =>
        axios.put(
          `${BASE_URL}/products/${item.productId}/increment-stock`,
          {
            quantity: item.quantity,
          }
        )
      )
    );
  }

  return {
    ok: failed.length === 0,
    failed,
    succeeded,
  };
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  const {
    cartItems,
    clearCart,
    updateQty,
    removeFromCart,
  } = useCart();

  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [brokenImages, setBrokenImages] = useState({});

  const markImageBroken = (key) => {
    setBrokenImages((prev) => {
      if (prev[key]) return prev;

      return {
        ...prev,
        [key]: true,
      };
    });
  };

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

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderDetails, setOrderDetails] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponList, setShowCouponList] = useState(false);
  const [, setFetchingCoupons] = useState(false);

  const [baseFare, setBaseFare] = useState(50);
  const [deliveryFee, setDeliveryFee] = useState(50);
  const [distanceInfo, setDistanceInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [detectedAreaName, setDetectedAreaName] = useState("");

  const subtotal = useMemo(() => {
    return (cartItems || []).reduce((sum, item) => {
      return (
        sum +
        getUnitPrice(item) *
          Number(item.quantity || 1)
      );
    }, 0);
  }, [cartItems]);

  const productCount = useMemo(() => {
    return (cartItems || []).reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);
  }, [cartItems]);

  useEffect(() => {
    setDeliveryFee(
      getDynamicDeliveryFee(baseFare, productCount)
    );
  }, [baseFare, productCount]);

  const fetchDeliveryFee = async (
    targetAddress,
    coords = null
  ) => {
    const addr = targetAddress || address;
    const currentCoords = coords || userCoords;

    const fullAddr = [
      addr.street,
      addr.apartment,
      addr.city,
      addr.state,
      addr.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    if (!fullAddr && !currentCoords) {
      return;
    }

    setDeliveryLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/orders/calculate-delivery-fee`,
        {
          address: fullAddr,
          lat: currentCoords?.lat || null,
          lng: currentCoords?.lng || null,
        }
      );

      if (res.data?.success) {
        setBaseFare(
          Number(res.data.deliveryFee) || 50
        );

        setDistanceInfo({
          distanceKm: res.data.distanceKm,
          duration:
            res.data.durationText || "25 mins",
        });
      }
    } catch (err) {
      console.warn(
        "Delivery fee calculation fallback:",
        err.message
      );
    } finally {
      setDeliveryLoading(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        DELIVERY_LOCATION_KEY
      );

      if (!raw) return;

      const saved = JSON.parse(raw);

      if (
        !saved?.detectedAt ||
        Date.now() - saved.detectedAt >
          30 * 60 * 1000
      ) {
        return;
      }

      if (saved.coords) {
        setUserCoords(saved.coords);
      }

      if (saved.address) {
        setAddress((prev) => ({
          ...prev,
          street:
            saved.address.street || prev.street,
          city:
            saved.address.city || prev.city,
          state:
            saved.address.state || prev.state,
          pincode:
            saved.address.pincode ||
            prev.pincode,
        }));

        if (
          saved.address.street ||
          saved.address.city
        ) {
          setDetectedAreaName(
            [
              saved.address.street,
              saved.address.city,
            ]
              .filter(Boolean)
              .join(", ")
          );
        }
      }

      if (saved.coords) {
        fetchDeliveryFee(
          {
            ...address,
            ...(saved.address || {}),
          },
          saved.coords
        );
      }
    } catch (err) {
      console.warn(
        "Could not read handed-off location:",
        err.message
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hasAddress =
      (address.street &&
        address.street.trim().length >= 3) ||
      (address.city &&
        address.city.trim().length >= 3) ||
      (address.pincode &&
        address.pincode.trim().length >= 4) ||
      userCoords;

    if (!hasAddress) return;

    const debounceTimer = setTimeout(() => {
      fetchDeliveryFee(
        address,
        userCoords
      );
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    address.street,
    address.city,
    address.pincode,
    userCoords,
  ]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser"
      );
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

        try {
          const revRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`,
            {
              timeout: 4000,
            }
          );

          if (
            revRes.data &&
            revRes.data.address
          ) {
            const rawAddr =
              revRes.data.address;

            const area =
              rawAddr.suburb ||
              rawAddr.neighbourhood ||
              rawAddr.road ||
              rawAddr.residential ||
              "";

            const city =
              rawAddr.city ||
              rawAddr.town ||
              rawAddr.county ||
              "Lucknow";

            const state =
              rawAddr.state ||
              "Uttar Pradesh";

            const pincode =
              rawAddr.postcode || "";

            setAddress((prev) => ({
              ...prev,
              street:
                area || prev.street,
              city:
                city || prev.city,
              state:
                state || prev.state,
              pincode:
                pincode || prev.pincode,
            }));

            if (area) {
              setDetectedAreaName(
                `${area}, ${city}`
              );
            }
          }
        } catch (revErr) {
          console.warn(
            "Reverse geocode fallback:",
            revErr.message
          );
        } finally {
          setDetectingLocation(false);
        }

        fetchDeliveryFee(
          address,
          coords
        );
      },
      (err) => {
        console.warn(
          "Geolocation permission denied or error:",
          err.message
        );

        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      setFetchingCoupons(true);

      try {
        const res = await axios.get(
          `${BASE_URL}/coupons`
        );

        const data = res.data;

        let list = [];

        if (Array.isArray(data)) {
          list = data;
        } else if (
          Array.isArray(data?.coupons)
        ) {
          list = data.coupons;
        } else if (
          Array.isArray(data?.data)
        ) {
          list = data.data;
        }

        const now = new Date().setHours(
          0,
          0,
          0,
          0
        );

        const validCoupons = list.filter(
          (c) => {
            if (!c.isActive) return false;

            if (
              c.expiryDate &&
              new Date(c.expiryDate) < now
            ) {
              return false;
            }

            return true;
          }
        );

        setAvailableCoupons(
          validCoupons
        );
      } catch (err) {
        console.error(
          "Error fetching coupons for checkout:",
          err
        );
      } finally {
        setFetchingCoupons(false);
      }
    };

    fetchActiveCoupons();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userAddresses =
      user.addresses || [];

    const defaultAddr =
      userAddresses.find(
        (a) => a.isDefault
      ) ||
      userAddresses[0] ||
      {};

    setAddress((prev) => ({
      ...prev,
      name:
        user.name || prev.name,
      phone:
        user.phone || prev.phone,
      street:
        defaultAddr.street ||
        prev.street,
      city:
        defaultAddr.city ||
        prev.city,
      state:
        defaultAddr.state ||
        prev.state,
      pincode:
        defaultAddr.pincode ||
        prev.pincode,
    }));
  }, [user]);

  const calculateDiscount = () => {
    if (!appliedCoupon) {
      return 0;
    }

    let discount = 0;

    if (
      appliedCoupon.discountType ===
      "percentage"
    ) {
      discount =
        (subtotal *
          Number(
            appliedCoupon.discountValue ||
              0
          )) /
        100;

      if (
        appliedCoupon.maxDiscountAmount &&
        discount >
          Number(
            appliedCoupon.maxDiscountAmount
          )
      ) {
        discount = Number(
          appliedCoupon.maxDiscountAmount
        );
      }
    } else {
      discount =
        Number(
          appliedCoupon.discountValue
        ) || 0;
    }

    return Math.min(
      discount,
      subtotal
    );
  };

  const discount =
    calculateDiscount();

  const foodTotal = Math.max(
    0,
    subtotal - discount
  );

  const grandTotal =
    foodTotal + deliveryFee;

  const onlinePayable =
    grandTotal;

  const applyCouponHandler =
    async (codeToApply) => {
      const targetCode =
        codeToApply || couponCode;

      if (!targetCode.trim()) {
        setCouponError(
          "Please enter a coupon code"
        );
        return;
      }

      setCouponLoading(true);
      setCouponError("");

      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res = await axios.post(
          `${BASE_URL}/coupons/validate`,
          {
            code: targetCode,
            cartTotal: subtotal,
          },
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (
          res.data?.success ||
          res.data?.coupon
        ) {
          setAppliedCoupon(
            res.data.coupon ||
              res.data
          );

          setCouponCode(
            targetCode
          );

          setCouponError("");
          setShowCouponList(false);
        } else {
          setCouponError(
            res.data?.message ||
              "Invalid coupon code"
          );
        }
      } catch (err) {
        console.error(
          "Coupon validation error:",
          err
        );

        setCouponError(
          err.response?.data?.message ||
            "Failed to apply coupon. Code may be invalid or expired."
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

  const handleStepClick = (
    clickedStep
  ) => {
    if (step === 4) return;

    if (clickedStep <= step) {
      setStep(clickedStep);
    }
  };

  const isAddressValid = () => {
    return Boolean(
      address.name?.trim() &&
        address.phone?.trim() &&
        address.street?.trim() &&
        address.city?.trim() &&
        address.pincode?.trim()
    );
  };

  const buildOrderPayload = (
    guestId
  ) => ({
    guestId,

    items: cartItems.map(
      (item) => ({
        productId:
          getProductId(item),

        title:
          item.title ||
          item.name ||
          "Product",

        image:
          getItemImage(item),

        price:
          getUnitPrice(item),

        quantity:
          Number(
            item.quantity || 1
          ),
      })
    ),

    address,

    dropLocation: {
      address: [
        address.street,
        address.apartment,
        address.city,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", "),

      lat:
        userCoords?.lat ||
        null,

      lng:
        userCoords?.lng ||
        null,
    },

    paymentMethod,

    subtotal:
      Number(subtotal.toFixed(2)),

    delivery:
      Number(deliveryFee.toFixed(2)),

    discount:
      Number(discount.toFixed(2)),

    total:
      Number(grandTotal.toFixed(2)),

    couponCode:
      appliedCoupon?.code ||
      null,
  });

  const handleCodOrder = async (
    token,
    guestId
  ) => {
    const res =
      await axios.post(
        `${BASE_URL}/orders/place`,
        buildOrderPayload(
          guestId
        ),
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

    return res.data;
  };

  const handleRazorpayOrder = async (
    token,
    guestId
  ) => {
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Razorpay SDK failed to load. Check your internet connection."
      );
    }

    if (
      !window.Razorpay
    ) {
      throw new Error(
        "Razorpay Checkout is not available."
      );
    }

    const payload =
      buildOrderPayload(
        guestId
      );

    /*
     * IMPORTANT:
     * The backend expects amount in rupees and converts it to paise.
     */
    const amount = Number(
      onlinePayable.toFixed(2)
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Invalid payment amount."
      );
    }

    console.log(
      "[RAZORPAY] Creating order:",
      {
        amount,
        currency: "INR",
        paymentMethod,
      }
    );

    const createRes =
      await axios.post(
        `${BASE_URL}/orders/create-razorpay-order`,
        {
          amount,
          currency: "INR",
          guestId,
          paymentMethod,
          items: payload.items,
        },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

    if (
      !createRes.data?.success
    ) {
      throw new Error(
        createRes.data?.message ||
          "Could not initialize payment."
      );
    }

    const razorpayOrder =
      createRes.data?.order;

    const keyId =
      createRes.data?.keyId;

    /*
     * FIX:
     * paymentDocId was previously not being passed
     * to verify-and-place.
     */
    const paymentDocId =
      createRes.data?.paymentDocId;

    if (
      !razorpayOrder?.id
    ) {
      throw new Error(
        "Razorpay order ID was not returned by server."
      );
    }

    if (!keyId) {
      throw new Error(
        "Razorpay Key ID was not returned by server."
      );
    }

    console.log(
      "[RAZORPAY] Order created:",
      razorpayOrder.id
    );

    console.log(
      "[RAZORPAY] Payment document:",
      paymentDocId || "not returned"
    );

    return new Promise(
      (resolve, reject) => {
        let settled = false;

        const finishResolve =
          (value) => {
            if (settled) return;

            settled = true;
            resolve(value);
          };

        const finishReject =
          (error) => {
            if (settled) return;

            settled = true;
            reject(error);
          };

        const options = {
          key: keyId,

          amount:
            razorpayOrder.amount,

          currency:
            razorpayOrder.currency ||
            "INR",

          name:
            "ShyamBakers",

          description:
            "Order Payment",

          order_id:
            razorpayOrder.id,

          prefill: {
            name:
              address.name || "",

            contact:
              address.phone || "",
          },

          theme: {
            color:
              "#880559",
          },

          /*
           * Keep the Checkout configuration simple.
           * Razorpay Dashboard controls enabled payment methods.
           */
          notes: {
            guestId:
              String(
                guestId || ""
              ),
          },

          handler:
            async (
              response
            ) => {
              try {
                console.log(
                  "[RAZORPAY] Payment success:",
                  {
                    orderId:
                      response?.razorpay_order_id,

                    paymentId:
                      response?.razorpay_payment_id,
                  }
                );

                if (
                  !response?.razorpay_order_id ||
                  !response?.razorpay_payment_id ||
                  !response?.razorpay_signature
                ) {
                  throw new Error(
                    "Razorpay returned an incomplete payment response."
                  );
                }

                /*
                 * IMPORTANT:
                 * Verify payment on backend.
                 * paymentDocId is now included.
                 */
                const verifyRes =
                  await axios.post(
                    `${BASE_URL}/orders/verify-and-place`,
                    {
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,

                      paymentDocId:
                        paymentDocId ||
                        undefined,

                      ...buildOrderPayload(
                        guestId
                      ),
                    },
                    {
                      headers:
                        token
                          ? {
                              Authorization: `Bearer ${token}`,
                            }
                          : {},
                    }
                  );

                console.log(
                  "[RAZORPAY] Verification response:",
                  verifyRes.data
                );

                if (
                  !verifyRes.data?.success
                ) {
                  throw new Error(
                    verifyRes.data?.message ||
                      "Payment verification failed."
                  );
                }

                finishResolve(
                  verifyRes.data
                );
              } catch (err) {
                console.error(
                  "[RAZORPAY] Verify / place error:",
                  err.response?.data ||
                    err
                );

                finishReject(err);
              }
            },

          modal: {
            ondismiss:
              () => {
                console.warn(
                  "[RAZORPAY] Checkout dismissed by customer."
                );

                finishReject(
                  new Error(
                    "Payment cancelled by user."
                  )
                );
              },
          },
        };

        let rzp;

        try {
          rzp =
            new window.Razorpay(
              options
            );

          rzp.on(
            "payment.failed",
            (response) => {
              console.error(
                "===== RAZORPAY PAYMENT FAILED ====="
              );

              console.error(
                "CODE:",
                response?.error?.code
              );

              console.error(
                "DESCRIPTION:",
                response?.error?.description
              );

              console.error(
                "SOURCE:",
                response?.error?.source
              );

              console.error(
                "STEP:",
                response?.error?.step
              );

              console.error(
                "REASON:",
                response?.error?.reason
              );

              console.error(
                "METADATA:",
                response?.error?.metadata
              );

              const description =
                response?.error
                  ?.description ||
                response?.error
                  ?.reason ||
                "Payment failed. Please try another payment method.";

              finishReject(
                new Error(
                  description
                )
              );
            }
          );

          rzp.open();
        } catch (err) {
          console.error(
            "[RAZORPAY] Checkout open error:",
            err
          );

          finishReject(
            err
          );
        }
      }
    );
  };

  const handlePlaceOrder =
    async () => {
      if (
        !cartItems?.length
      ) {
        return;
      }

      if (placing) {
        return;
      }

      if (
        !isAddressValid()
      ) {
        setOrderError(
          "Please complete your delivery address."
        );
        return;
      }

      if (
        paymentMethod !==
          "cod" &&
        grandTotal <= 0
      ) {
        setOrderError(
          "Invalid payment amount."
        );
        return;
      }

      setPlacing(true);
      setOrderError("");

      const orderItems =
        cartItems.map(
          (item) => ({
            productId:
              getProductId(item),

            title:
              item.title ||
              item.name ||
              "Product",

            quantity:
              Number(
                item.quantity || 1
              ),
          })
        );

      /*
       * IMPORTANT FIX:
       *
       * We DO NOT decrement stock here anymore.
       *
       * Old flow:
       * stock decrement
       * -> Razorpay
       *
       * New flow:
       * Razorpay
       * -> verify/place
       * -> stock decrement
       *
       * For COD:
       * place order
       * -> stock decrement
       */

      try {
        const guestId =
          getGuestId();

        const token =
          localStorage.getItem(
            "token"
          );

        let result;

        if (
          paymentMethod ===
          "cod"
        ) {
          /*
           * COD:
           * Create order first.
           */
          result =
            await handleCodOrder(
              token,
              guestId
            );

          if (
            !result?.success
          ) {
            setOrderError(
              result?.message ||
                "Failed to place order."
            );

            return;
          }

          /*
           * Only after successful COD order
           * do we decrease stock.
           */
          const stockResult =
            await decrementStockAfterSuccess(
              orderItems
            );

          if (
            !stockResult.ok
          ) {
            console.error(
              "[STOCK] COD order created but stock update failed:",
              stockResult.failed
            );

            /*
             * Do not pretend that the stock update succeeded.
             * The order already exists, so we show a clear warning.
             */
            setOrderError(
              "Order was created, but stock synchronization needs attention. Please contact support."
            );

            setOrderDetails(
              result.data
            );

            clearCart();

            try {
              localStorage.removeItem(
                DELIVERY_LOCATION_KEY
              );
            } catch (err) {}

            setStep(4);

            return;
          }
        } else {
          /*
           * ONLINE PAYMENT:
           *
           * Razorpay payment + backend verification
           * must succeed before stock is decremented.
           */
          result =
            await handleRazorpayOrder(
              token,
              guestId
            );

          if (
            !result?.success
          ) {
            setOrderError(
              result?.message ||
                "Payment verification failed."
            );

            return;
          }

          /*
           * Payment and order are now confirmed.
           * Decrease stock only now.
           */
          const stockResult =
            await decrementStockAfterSuccess(
              orderItems
            );

          if (
            !stockResult.ok
          ) {
            console.error(
              "[STOCK] Online payment succeeded but stock update failed:",
              stockResult.failed
            );

            /*
             * IMPORTANT:
             * Do NOT create another order here.
             * Payment/order already succeeded.
             *
             * Show order success while flagging stock sync.
             */
            setOrderDetails(
              result.data
            );

            clearCart();

            try {
              localStorage.removeItem(
                DELIVERY_LOCATION_KEY
              );
            } catch (err) {}

            setOrderError(
              "Payment and order were successful, but stock synchronization needs attention. Please contact support."
            );

            setStep(4);

            return;
          }
        }

        /*
         * Normal successful flow.
         */
        setOrderDetails(
          result.data
        );

        clearCart();

        try {
          localStorage.removeItem(
            DELIVERY_LOCATION_KEY
          );
        } catch (err) {}

        setStep(4);
      } catch (err) {
        console.error(
          "Place Order Error:",
          err.response?.data ||
            err
        );

        setOrderError(
          err.response?.data?.message ||
            err.message ||
            "Failed to place order. Please try again."
        );
      } finally {
        setPlacing(false);
      }
    };

  const ProgressBar =
    () => (
      <div className="progress-bar">
        {STEP_DEFINITIONS.map(
          (s, idx) => {
            const isComplete =
              step > s.id;

            const isActive =
              step === s.id;

            const Icon =
              s.icon;

            return (
              <React.Fragment
                key={s.id}
              >
                <button
                  type="button"
                  className={`progress-bar__step ${
                    isActive
                      ? "is-active"
                      : ""
                  } ${
                    isComplete
                      ? "is-complete"
                      : ""
                  }`}
                  onClick={() =>
                    handleStepClick(
                      s.id
                    )
                  }
                >
                  <span className="progress-bar__icon">
                    {isComplete ? (
                      <AiOutlineCheck />
                    ) : (
                      <Icon />
                    )}
                  </span>

                  <span className="progress-bar__label">
                    {s.label}
                  </span>
                </button>

                {idx <
                  STEP_DEFINITIONS.length -
                    1 && (
                  <span
                    className={`progress-bar__connector ${
                      step > s.id
                        ? "is-complete"
                        : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          }
        )}
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
            onClick={() =>
              navigate(-1)
            }
          >
            <FiArrowLeft />
          </button>

          <div className="panel-header">
            <h2 className="panel-title">
              Your cart
            </h2>

            <span className="panel-count">
              {cartItems.length} item
              {cartItems.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>

          {cartItems.length ===
          0 ? (
            <div
              className="cart-item"
              style={{
                justifyContent:
                  "center",
                padding:
                  "24px 0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                }}
              >
                Your cart is
                empty.
              </p>
            </div>
          ) : (
            <div className="cart-list">
              {cartItems.map(
                (item) => {
                  const unitPrice =
                    getUnitPrice(
                      item
                    );

                  const itemKey =
                    item.key ||
                    item._id ||
                    item.productId ||
                    item.id;

                  const imgSrc =
                    getItemImage(
                      item
                    );

                  const showImage =
                    imgSrc &&
                    !brokenImages[
                      itemKey
                    ];

                  return (
                    <div
                      key={itemKey}
                      className="cart-item"
                    >
                      {showImage ? (
                        <img
                          src={imgSrc}
                          alt={
                            item.title
                          }
                          className="cart-item__thumb"
                          onError={() =>
                            markImageBroken(
                              itemKey
                            )
                          }
                        />
                      ) : (
                        <div
                          className="cart-item__thumb"
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            background:
                              "#f3f4f6",
                            color:
                              "#9ca3af",
                          }}
                        >
                          <FiShoppingBag />
                        </div>
                      )}

                      <div className="cart-item__info">
                        <p className="cart-item__title">
                          {item.title}
                        </p>

                        <div
                          className="quantity-control"
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "8px",
                            marginTop:
                              "6px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                itemKey,
                                item.quantity -
                                  1
                              )
                            }
                            disabled={
                              item.quantity <=
                              1
                            }
                            aria-label="Decrease quantity"
                          >
                            <FiMinus />
                          </button>

                          <span>
                            {
                              item.quantity
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQty(
                                itemKey,
                                item.quantity +
                                  1
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "12px",
                        }}
                      >
                        <div className="cart-item__price">
                          ₹{" "}
                          {(
                            unitPrice *
                            item.quantity
                          ).toFixed(2)}
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            removeFromCart(
                              itemKey
                            )
                          }
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <div className="cart-subtotal">
            <span>
              Total
            </span>

            <span>
              ₹{" "}
              {subtotal.toFixed(
                2
              )}
            </span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="checkout-left">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">
                Shipping address
              </h2>

              {detectedAreaName && (
                <p className="panel-subtitle panel-subtitle--success">
                  <AiOutlineCheck />{" "}
                  Auto-filled:{" "}
                  {detectedAreaName}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={
                detectLocation
              }
              disabled={
                detectingLocation
              }
              className={`gps-button ${
                detectingLocation
                  ? "is-loading"
                  : ""
              }`}
            >
              <AiOutlineEnvironment />

              {detectingLocation
                ? "Detecting GPS…"
                : userCoords
                ? "Location auto-filled"
                : "Auto-detect location"}
            </button>
          </div>

          {user?.addresses &&
            user.addresses.length >
              1 && (
              <div className="form-group">
                <label>
                  Select saved
                  address
                </label>

                <select
                  className="saved-address-select"
                  onChange={(
                    e
                  ) => {
                    const selected =
                      user.addresses[
                        e.target.value
                      ];

                    if (
                      selected
                    ) {
                      setAddress(
                        (
                          prev
                        ) => ({
                          ...prev,
                          street:
                            selected.street ||
                            "",
                          city:
                            selected.city ||
                            "",
                          state:
                            selected.state ||
                            "",
                          pincode:
                            selected.pincode ||
                            "",
                        })
                      );
                    }
                  }}
                >
                  {user.addresses.map(
                    (
                      addr,
                      idx
                    ) => (
                      <option
                        key={
                          addr._id ||
                          idx
                        }
                        value={idx}
                      >
                        {addr.isDefault
                          ? "[Default] "
                          : ""}
                        {addr.street
                          ? `${addr.street}, ${addr.city}`
                          : `Address #${
                              idx +
                              1
                            }`}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

          <div className="form-group">
            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Recipient's Full Name"
              value={
                address.name
              }
              onChange={(e) =>
                setAddress({
                  ...address,
                  name: e.target
                    .value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Phone Number
            </label>

            <input
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              value={
                address.phone
              }
              onChange={(e) =>
                setAddress({
                  ...address,
                  phone: e.target
                    .value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Street Address
            </label>

            <input
              type="text"
              placeholder="House number and street name"
              value={
                address.street
              }
              onChange={(e) =>
                setAddress({
                  ...address,
                  street:
                    e.target
                      .value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>
              Apartment,
              Suite, Unit
              (Optional)
            </label>

            <input
              type="text"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={
                address.apartment ||
                ""
              }
              onChange={(e) =>
                setAddress({
                  ...address,
                  apartment:
                    e.target
                      .value,
                })
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                City
              </label>

              <input
                type="text"
                placeholder="City"
                value={
                  address.city
                }
                onChange={(
                  e
                ) =>
                  setAddress({
                    ...address,
                    city: e.target
                      .value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>
                State
              </label>

              <input
                type="text"
                placeholder="State"
                value={
                  address.state ||
                  ""
                }
                onChange={(
                  e
                ) =>
                  setAddress({
                    ...address,
                    state:
                      e.target
                        .value,
                  })
                }
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Postal Code
              </label>

              <input
                type="text"
                placeholder="Postal Code"
                value={
                  address.pincode
                }
                onChange={(
                  e
                ) =>
                  setAddress({
                    ...address,
                    pincode:
                      e.target
                        .value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>
                Country
              </label>

              <input
                type="text"
                placeholder="Country"
                value={
                  address.country ||
                  ""
                }
                onChange={(
                  e
                ) =>
                  setAddress({
                    ...address,
                    country:
                      e.target
                        .value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="checkout-left">
          <h2
            className="panel-title"
            style={{
              paddingBottom:
                "22px",
            }}
          >
            Select payment
            method
          </h2>

          {orderError && (
            <div className="alert alert--error">
              {orderError}
            </div>
          )}

          <div className="payment-methods">
            <div
              className={`payment-option ${
                paymentMethod ===
                "card"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                !placing &&
                setPaymentMethod(
                  "card"
                )
              }
            >
              <input
                type="radio"
                checked={
                  paymentMethod ===
                  "card"
                }
                readOnly
              />

              <span className="payment-option__icon">
                <AiOutlineCreditCard />
              </span>

              <div className="payment-option__body">
                <span className="payment-option__title">
                  Credit /
                  Debit Card
                </span>

                <span className="payment-option__meta">
                  via Razorpay
                </span>
              </div>

              <span className="payment-option__radio" />
            </div>

            <div
              className={`payment-option ${
                paymentMethod ===
                "upi"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                !placing &&
                setPaymentMethod(
                  "upi"
                )
              }
            >
              <input
                type="radio"
                checked={
                  paymentMethod ===
                  "upi"
                }
                readOnly
              />

              <span className="payment-option__icon">
                <AiOutlineMobile />
              </span>

              <div className="payment-option__body">
                <span className="payment-option__title">
                  UPI
                </span>

                <span className="payment-option__meta">
                  via Razorpay
                </span>
              </div>

              <span className="payment-option__radio" />
            </div>

            {paymentMethod ===
              "cod" && (
              <div className="payment-note payment-note--warning">
                <p>
                  💵 Cash on
                  Delivery
                  (Pay on
                  Arrival)
                </p>

                <p>
                  Pay Grand
                  Total (₹
                  {grandTotal.toFixed(
                    2
                  )}
                  ) directly
                  to the
                  delivery
                  partner —
                  that includes
                  Food ₹
                  {foodTotal.toFixed(
                    2
                  )}{" "}
                  + Delivery ₹
                  {deliveryFee.toFixed(
                    2
                  )}
                  .
                </p>
              </div>
            )}

            {(paymentMethod ===
              "card" ||
              paymentMethod ===
                "upi") && (
              <div className="payment-note payment-note--success">
                <p>
                  💳 Pay Online
                  Now: ₹
                  {onlinePayable.toFixed(
                    2
                  )}
                </p>

                <p>
                  One single
                  payment —
                  Food ₹
                  {foodTotal.toFixed(
                    2
                  )}{" "}
                  + Delivery ₹
                  {deliveryFee.toFixed(
                    2
                  )}{" "}
                  are both
                  included.
                  Nothing more
                  to pay on
                  arrival.
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

          <h2>
            Order Placed
            Successfully!
          </h2>

          <p className="success-subtitle">
            Thank you for
            shopping with us.
            We've received
            your order and
            are processing it.
          </p>

          {orderError && (
            <div className="alert alert--error">
              {orderError}
            </div>
          )}

          <div className="order-details-card">
            <div className="order-detail-row">
              <span>
                Order Reference
              </span>

              <strong>
                #
                {orderDetails?.orderId ||
                  orderDetails?._id ||
                  "N/A"}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>
                Payment Method
              </span>

              <strong
                style={{
                  textTransform:
                    "uppercase",
                }}
              >
                {orderDetails?.paymentMethod ||
                  paymentMethod}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>
                🛵 Delivery
                Fee
              </span>

              <strong>
                ₹
                {Number(
                  orderDetails?.delivery ??
                    deliveryFee
                ).toFixed(2)}
              </strong>
            </div>

            <div className="order-detail-row">
              <span>
                📦 Food Total
              </span>

              <strong>
                ₹
                {Number(
                  orderDetails?.subtotal ??
                    subtotal
                ).toFixed(2)}
              </strong>
            </div>

            <div
              className="order-detail-row"
              style={{
                borderTop:
                  "2px solid #e5e7eb",
                paddingTop:
                  "10px",
                marginTop:
                  "4px",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                }}
              >
                💰 Grand Total
              </span>

              <strong className="amount-highlight">
                ₹
                {Number(
                  orderDetails
                    ? Number(
                        orderDetails.subtotal ||
                          0
                      ) +
                          Number(
                            orderDetails.delivery ||
                              0
                          ) -
                          Number(
                            orderDetails.discount ||
                              0
                          )
                    : grandTotal
                ).toFixed(2)}
              </strong>
            </div>

            {(orderDetails?.paymentMethod ||
              paymentMethod) !==
              "cod" && (
              <div
                className="order-detail-row"
                style={{
                  color:
                    "#6b7280",
                  fontSize:
                    "12px",
                }}
              >
                <span>
                  ✅ Paid Online
                  (Food +
                  Delivery)
                </span>

                <span>
                  ₹
                  {Number(
                    orderDetails?.total ??
                      onlinePayable
                  ).toFixed(
                    2
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="success-actions">
            <button
              className="primary-btn"
              onClick={() =>
                navigate(
                  "/orders"
                )
              }
            >
              View My Orders
            </button>

            <button
              className="secondary-btns"
              onClick={() =>
                navigate("/")
              }
            >
              Continue
              Shopping
            </button>
          </div>
        </div>
      )}

      {step !== 4 && (
        <div className="checkout-right">
          <h3>
            Your Order
          </h3>

          <div className="price-row">
            <span>
              Food Items
              Subtotal
            </span>

            <span>
              ₹{" "}
              {subtotal.toFixed(
                2
              )}
            </span>
          </div>

          {discount > 0 && (
            <div className="price-row discount-row">
              <span>
                Coupon Discount
              </span>

              <span>
                - ₹{" "}
                {discount.toFixed(
                  2
                )}
              </span>
            </div>
          )}

          {step >= 2 && (
            <div className="delivery-card">
              <div className="delivery-card__row">
                <span className="delivery-card__label">
                  🛵 Delivery Fee{" "}
                  {distanceInfo
                    ? `(${distanceInfo.distanceKm} km)`
                    : ""}
                </span>

                {deliveryFee >
                0 ? (
                  <span className="delivery-card__amount">
                    {deliveryLoading
                      ? "..."
                      : `₹ ${deliveryFee.toFixed(
                          2
                        )}`}
                  </span>
                ) : (
                  <span className="delivery-card__amount free-delivery-badge">
                    FREE
                  </span>
                )}
              </div>

              <p className="delivery-card__eta">
                ⏱️ Est.{" "}
                {distanceInfo?.duration ||
                  "25 mins"}{" "}
                ·{" "}
                <strong>
                  Included in your
                  total
                </strong>
              </p>
            </div>
          )}

          <div className="coupon-section">
            {appliedCoupon ? (
              <div className="coupon-applied">
                <div>
                  <span className="coupon-applied__code">
                    <AiOutlineTag />{" "}
                    {
                      appliedCoupon.code
                    }
                  </span>

                  <p className="coupon-applied__note">
                    Coupon applied
                    successfully!
                  </p>
                </div>

                <button
                  onClick={
                    handleRemoveCoupon
                  }
                  className="coupon-remove"
                  disabled={placing}
                >
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
                    value={
                      couponCode
                    }
                    onChange={(
                      e
                    ) =>
                      setCouponCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    disabled={
                      couponLoading ||
                      placing
                    }
                  />

                  <button
                    className="apply-coupon-btn"
                    onClick={() =>
                      applyCouponHandler()
                    }
                    disabled={
                      couponLoading ||
                      placing ||
                      !couponCode.trim()
                    }
                  >
                    {couponLoading
                      ? "..."
                      : "Apply"}
                  </button>
                </div>

                {availableCoupons.length >
                  0 && (
                  <div className="coupon-toggle-wrapper">
                    <button
                      type="button"
                      onClick={() =>
                        !placing &&
                        setShowCouponList(
                          (
                            prev
                          ) =>
                            !prev
                        )
                      }
                      className="coupon-toggle"
                    >
                      <span>
                        <AiOutlineTag />{" "}
                        View
                        Available
                        Coupons (
                        {
                          availableCoupons.length
                        }
                        )
                      </span>

                      {showCouponList ? (
                        <AiOutlineUp />
                      ) : (
                        <AiOutlineDown />
                      )}
                    </button>

                    {showCouponList && (
                      <div className="coupon-list">
                        {availableCoupons.map(
                          (c) => (
                            <div
                              key={
                                c._id ||
                                c.code
                              }
                              className="coupon-item"
                            >
                              <div>
                                <span className="coupon-item__code">
                                  {
                                    c.code
                                  }
                                </span>

                                <p className="coupon-item__desc">
                                  {c.discountType ===
                                  "percentage"
                                    ? `${c.discountValue}% OFF ${
                                        c.maxDiscountAmount
                                          ? `(Up to ₹${c.maxDiscountAmount})`
                                          : ""
                                      }`
                                    : `₹${c.discountValue} OFF`}

                                  {c.minOrderAmount
                                    ? ` on orders above ₹${c.minOrderAmount}`
                                    : ""}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  applyCouponHandler(
                                    c.code
                                  )
                                }
                                disabled={
                                  couponLoading ||
                                  placing
                                }
                                className="coupon-item__apply"
                              >
                                Apply
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {couponError && (
              <p className="coupon-error">
                {
                  couponError
                }
              </p>
            )}
          </div>

          <hr />

          <div className="price-total">
            <div>
              <span className="price-total__label">
                GRAND TOTAL
              </span>

              <p className="price-total__sub">
                Food ₹
                {foodTotal.toFixed(
                  2
                )}{" "}
                + Delivery ₹
                {deliveryFee.toFixed(
                  2
                )}
                {paymentMethod !==
                "cod"
                  ? " · Paid together online"
                  : " · Paid together on delivery"}
              </p>
            </div>

            <span className="price-total__amount">
              ₹
              {grandTotal.toFixed(
                2
              )}
            </span>
          </div>

          <div className="summary-action">
            {step === 1 && (
              <button
                className="confirm-order-btn"
                disabled={
                  cartItems.length ===
                  0
                }
                onClick={() =>
                  setStep(2)
                }
              >
                Continue to
                Address
              </button>
            )}

            {step === 2 && (
              <button
                className="confirm-order-btn"
                disabled={
                  !isAddressValid()
                }
                onClick={() =>
                  setStep(3)
                }
              >
                Continue to
                Payment
              </button>
            )}

            {step === 3 && (
              <button
                className="confirm-order-btn"
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  placing ||
                  cartItems.length ===
                    0
                }
              >
                {placing
                  ? "Processing..."
                  : paymentMethod ===
                    "cod"
                  ? `Place Order — Pay ₹${grandTotal.toFixed(
                      2
                    )} on Delivery`
                  : `Pay ₹${onlinePayable.toFixed(
                      2
                    )} Online`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
