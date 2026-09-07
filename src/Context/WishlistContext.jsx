import React, { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);

const getWishlistKey = (item) => {
    const title = (item?.title || "").trim().toLowerCase();
    const rest = item?.restaurantId ?? "no_rest";
    return `${title}__${rest}`;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const saved = localStorage.getItem("wishlist_items");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("wishlist_items", JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const isInWishlist = (item) => {
        const key = getWishlistKey(item);
        return wishlistItems.some((x) => x.key === key);
    };

    const toggleWishlist = (item) => {
        const key = getWishlistKey(item);
        setWishlistItems((prev) => {
            const exists = prev.some((x) => x.key === key);
            if (exists) {
                return prev.filter((x) => x.key !== key);
            }
            return [...prev, { ...item, key }];
        });
    };

    const removeFromWishlist = (key) => {
        setWishlistItems((prev) => prev.filter((x) => x.key !== key));
    };

    const clearWishlist = () => setWishlistItems([]);

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                isInWishlist,
                toggleWishlist,
                removeFromWishlist,
                clearWishlist,
                getWishlistKey,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
    return ctx;
};