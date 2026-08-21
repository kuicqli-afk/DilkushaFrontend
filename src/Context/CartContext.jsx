import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

// ✅ Standardized composite key helper
const getCartKey = (item) => {
  const title = (item?.title || "").trim().toLowerCase();
  const rest = item?.restaurantId ?? "no_rest";
  return `${title}__${rest}`;
};

// ✅ Preserves productId and _id during normalization
const normalizeCart = (arr) => {
  const map = new Map();
  (arr || []).forEach((x) => {
    const productId = x._id || x.productId || x.id;
    const key = x.key || `${(x.title || "").trim().toLowerCase()}__${x.restaurantId ?? "no_rest"}`;

    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, quantity: (prev.quantity || 0) + (x.quantity || 0) });
    } else {
      map.set(key, {
        ...x,
        key,
        _id: productId,
        productId: productId,
        quantity: x.quantity || 1,
      });
    }
  });
  return Array.from(map.values());
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_items");
      const parsed = saved ? JSON.parse(saved) : [];
      return normalizeCart(parsed);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Add to cart with key + ID enforcement
  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const productId = product._id || product.id || product.productId;

      if (!productId) {
        console.error("Cannot add item without valid ID:", product);
        return prevItems;
      }

      const key = product.key || getCartKey(product);
      const existingIndex = prevItems.findIndex((item) => item.key === key || (item._id || item.productId) === productId);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          ...product,
          key,
          productId: productId,
          _id: productId,
          quantity,
        },
      ];
    });
  };

  const setItemQty = (item, quantity) => {
    const key = item.key || getCartKey(item);
    const productId = item._id || item.id || item.productId;
    const qty = Math.max(1, Number(quantity) || 1);

    setCartItems((prev) => {
      const exist = prev.find((x) => x.key === key || (x._id || x.productId) === productId);

      if (exist) {
        return prev.map((x) => (x.key === key || (x._id || x.productId) === productId ? { ...x, quantity: qty } : x));
      }

      return [
        ...prev,
        {
          ...item,
          key,
          _id: productId,
          productId: productId,
          id: productId,
          quantity: qty,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((x) => x.key !== key && x._id !== key && x.productId !== key));
  };

  const updateQty = (key, quantity) => {
    setCartItems((prev) => {
      const qty = Number(quantity) || 0;
      if (qty <= 0) return prev.filter((x) => x.key !== key && x._id !== key && x.productId !== key);
      return prev.map((x) => (x.key === key || x._id === key || x.productId === key ? { ...x, quantity: qty } : x));
    });
  };

  const clearCart = () => setCartItems([]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, x) => sum + (Number(x.price) || 0) * (x.quantity || 1), 0);
    return { subtotal };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        setItemQty,
        removeFromCart,
        updateQty,
        clearCart,
        totals,
        getCartKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};