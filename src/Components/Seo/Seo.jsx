import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-route <title>, meta description and canonical link.
// Google renders the SPA, so these give every page its own search snippet —
// distinct, descriptive pages are what Google picks sitelinks from.

// Uses the domain the site is actually served from. Once Dilkusha Biryani has
// its final domain, hard-code it here, e.g. "https://www.yourdomain.com", so
// canonical links always point at the live site.
const SITE_URL = window.location.origin;
const SITE_NAME = "Dilkusha Biryani";
const DEFAULT_TITLE = `${SITE_NAME} | Biryani, Kebabs & Non-Veg Food Online in Lucknow`;
const DEFAULT_DESCRIPTION =
  "Order fresh biryani, kebabs, curries, rolls and breads online from Dilkusha Biryani, Lucknow. Fast home delivery and daily offers.";

const titleCase = (value) =>
  decodeURIComponent(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const STATIC_PAGES = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  "/category/all": {
    title: `Full Menu | ${SITE_NAME}`,
    description: "Browse the full menu at Dilkusha Biryani — biryani, kebabs, curries, rolls, breads and more.",
  },
  "/all-offers": {
    title: `Offers & Deals | ${SITE_NAME}`,
    description: "Today's offers and discounts on biryani, kebabs and non-veg combos from Dilkusha Biryani, Lucknow.",
  },
  "/discount": {
    title: `Discount Offers | ${SITE_NAME}`,
    description: "Discounted biryani, kebabs and combo meals from Dilkusha Biryani.",
  },
  "/weekend-specials": {
    title: `Weekend Specials | ${SITE_NAME}`,
    description: "Weekend special biryani and non-veg deals from Dilkusha Biryani.",
  },
  "/restaurant": {
    title: `Our Outlets in Lucknow | ${SITE_NAME}`,
    description: "Dilkusha Biryani outlets and delivery areas across Lucknow.",
  },
  "/cart": { title: `Your Cart | ${SITE_NAME}`, noindex: true },
  "/checkout": { title: `Checkout | ${SITE_NAME}`, noindex: true },
  "/wishlist": { title: `Wishlist | ${SITE_NAME}`, noindex: true },
  "/orders": { title: `My Orders | ${SITE_NAME}`, noindex: true },
  "/profile": { title: `My Profile | ${SITE_NAME}`, noindex: true },
  "/login": { title: `Login | ${SITE_NAME}`, noindex: true },
  "/terms-and-conditions": {
    title: `Terms and Conditions | ${SITE_NAME}`,
    description: "Terms and conditions for ordering from Dilkusha Biryani.",
  },
  "/privacy-policy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: "How Dilkusha Biryani collects, uses and protects your information.",
  },
  "/about-us": {
    title: `About Us | ${SITE_NAME}`,
    description: "Dilkusha Biryani makes biryani, kebabs, curries and rolls in Lucknow, freshly cooked and delivered hot across the city.",
  },
  "/contact-us": {
    title: `Contact Us | ${SITE_NAME}`,
    description: "Call, WhatsApp or email Dilkusha Biryani, Lucknow, about orders, bulk orders and party orders.",
  },
  "/shipping-and-delivery": {
    title: `Shipping and Delivery | ${SITE_NAME}`,
    description: "Where Dilkusha Biryani delivers in Lucknow, delivery times and charges, cancellations and help with wrong or damaged items.",
  },
  "/become-a-rider": {
    title: `Become a Delivery Rider | ${SITE_NAME}`,
    description: "Join Dilkusha Biryani as a delivery rider partner in Lucknow.",
  },
};

const getPageMeta = (pathname) => {
  if (STATIC_PAGES[pathname]) return STATIC_PAGES[pathname];

  const [, first, second, third] = pathname.split("/");

  if (first === "category" && second) {
    const name = titleCase(third || second);
    return {
      title: `${name} | Order Online | ${SITE_NAME}`,
      description: `Order ${name.toLowerCase()} online from Dilkusha Biryani, Lucknow. Freshly cooked, great prices and fast delivery.`,
    };
  }
  if (first === "restaurant" && second) {
    const area = titleCase(second);
    return {
      title: `Dilkusha Biryani ${area}, Lucknow`,
      description: `Visit or order from the Dilkusha Biryani outlet in ${area}, Lucknow.`,
    };
  }
  if ((first === "offers" || first === "offer-details") && second) {
    return {
      title: `${titleCase(second)} Offer | ${SITE_NAME}`,
      description: `${titleCase(second)} — special offer on biryani and non-veg dishes at Dilkusha Biryani.`,
    };
  }
  if (first === "section" && second) {
    return { title: `${titleCase(second)} | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION };
  }
  if (first && first.startsWith("all-")) {
    return {
      title: `${titleCase(first.slice(4))} | ${SITE_NAME}`,
      description: `Order ${titleCase(first.slice(4)).toLowerCase()} online from Dilkusha Biryani, Lucknow.`,
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