import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-route <title>, meta description and canonical link.
// Google renders the SPA, so these give every page its own search snippet —
// distinct, descriptive pages are what Google picks sitelinks from.

const SITE_URL = "https://shyamnamkeenandbakers.online";
const SITE_NAME = "Shyam Namkeen & Bakers";
const DEFAULT_TITLE = `${SITE_NAME} | Namkeen, Cakes & Bakery Online in Lucknow`;
const DEFAULT_DESCRIPTION =
  "Order fresh namkeen, bhujiya, chips, cakes, pastries, cookies and bakery items online from Shyam Namkeen & Bakers, Lucknow. Fast home delivery and daily offers.";

const titleCase = (value) =>
  decodeURIComponent(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const STATIC_PAGES = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  "/category/all": {
    title: `All Categories | ${SITE_NAME}`,
    description: "Browse every category at Shyam Namkeen & Bakers — namkeen, bhujiya, chips, sev, cakes, pastries, cookies and more.",
  },
  "/all-offers": {
    title: `Offers & Deals | ${SITE_NAME}`,
    description: "Today's offers and discounts on namkeen, cakes and bakery items from Shyam Namkeen & Bakers, Lucknow.",
  },
  "/discount": {
    title: `Discount Offers | ${SITE_NAME}`,
    description: "Discounted namkeen, snacks and bakery items from Shyam Namkeen & Bakers.",
  },
  "/weekend-specials": {
    title: `Weekend Specials | ${SITE_NAME}`,
    description: "Weekend special namkeen and bakery deals from Shyam Namkeen & Bakers.",
  },
  "/restaurant": {
    title: `Our Outlets in Lucknow | ${SITE_NAME}`,
    description: "Shyam Namkeen & Bakers outlets and delivery areas across Lucknow.",
  },
  "/cart": { title: `Your Cart | ${SITE_NAME}`, noindex: true },
  "/checkout": { title: `Checkout | ${SITE_NAME}`, noindex: true },
  "/wishlist": { title: `Wishlist | ${SITE_NAME}`, noindex: true },
  "/orders": { title: `My Orders | ${SITE_NAME}`, noindex: true },
  "/profile": { title: `My Profile | ${SITE_NAME}`, noindex: true },
  "/login": { title: `Login | ${SITE_NAME}`, noindex: true },
  "/terms-and-conditions": {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description: "Terms and conditions for ordering from Shyam Namkeen & Bakers.",
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How Shyam Namkeen & Bakers collects, uses and protects your information.",
  },
  "/about-us": {
    title: `About Us | ${SITE_NAME}`,
    description: "Shyam Namkeen & Bakers makes pure veg namkeen, gajak, cakes and cookies in Lucknow, freshly prepared and delivered across the city.",
  },
  "/contact-us": {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Call, WhatsApp or email Shyam Namkeen & Bakers, Lucknow, about orders, bulk orders and custom cakes.",
  },
  "/shipping-and-delivery": {
    title: `Shipping and Delivery | ${SITE_NAME}`,
    description: "Where Shyam Namkeen & Bakers delivers in Lucknow, delivery times and charges, cancellations and help with wrong or damaged items.",
  },
  "/become-a-rider": {
    title: `Become a Delivery Rider | ${SITE_NAME}`,
    description: "Join Shyam Namkeen & Bakers as a delivery rider partner in Lucknow.",
  },
};

const getPageMeta = (pathname) => {
  if (STATIC_PAGES[pathname]) return STATIC_PAGES[pathname];

  const [, first, second, third] = pathname.split("/");

  if (first === "category" && second) {
    const name = titleCase(third || second);
    return {
      title: `${name} | Buy Online | ${SITE_NAME}`,
      description: `Order ${name.toLowerCase()} online from Shyam Namkeen & Bakers, Lucknow. Fresh stock, best prices and fast delivery.`,
    };
  }
  if (first === "restaurant" && second) {
    const area = titleCase(second);
    return {
      title: `Shyam Namkeen & Bakers ${area}, Lucknow`,
      description: `Visit or order from the Shyam Namkeen & Bakers outlet in ${area}, Lucknow.`,
    };
  }
  if ((first === "offers" || first === "offer-details") && second) {
    return {
      title: `${titleCase(second)} Offer | ${SITE_NAME}`,
      description: `${titleCase(second)} — special offer on namkeen and bakery items at Shyam Namkeen & Bakers.`,
    };
  }
  if (first === "section" && second) {
    return { title: `${titleCase(second)} | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION };
  }
  if (first && first.startsWith("all-")) {
    return {
      title: `${titleCase(first.slice(4))} | ${SITE_NAME}`,
      description: `Shop ${titleCase(first.slice(4)).toLowerCase()} online from Shyam Namkeen & Bakers, Lucknow.`,
    };
  }
  // product pages set a better title themselves once the product loads
  if (first === "order") return { title: `Order Online | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION };

  return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
};

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const setMeta = (attr, key, content) => {
  const el = upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute("content", content);
};

const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description = DEFAULT_DESCRIPTION, noindex = false } = getPageMeta(pathname);
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);

    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    canonical.setAttribute("href", url);
  }, [pathname]);

  return null;
};

export default Seo;
