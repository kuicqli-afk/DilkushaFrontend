import React, { useState } from "react";
import "./motion.css";

// Building blocks for the site's one motion system (see motion.css).
// They only render markup and attributes; motion.css animates it and
// revealObserver.js decides when. No animation JavaScript runs per frame.

/* ================= IMAGES ================= */

// A photo that dissolves in once it has downloaded and decoded, over a
// skeleton shimmer in its frame. The photo itself never moves.
// `priority` is for the one image the visitor sees first (the top banner):
// it loads at high priority and shows the moment it arrives, with no fade,
// because that image is what the browser measures as the page's main paint.
export const RevealImage = ({ className = "", priority = false, onLoad, onError, ...rest }) => {
  const [loaded, setLoaded] = useState(priority);
  const priorityProps = priority ? { loading: "eager", fetchPriority: "high" } : {};

  return (
    <img
      {...rest}
      {...priorityProps}
      className={`reveal-img${loaded ? " is-loaded" : ""} ${className}`.trim()}
      onLoad={(e) => {
        // decode first, so the fade never stalls on a decode half-way
        const img = e.currentTarget;
        (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => setLoaded(true));
        onLoad?.(e);
      }}
      onError={(e) => {
        setLoaded(true);
        onError?.(e);
      }}
    />
  );
};

/* ================= TEXT ================= */

// A block whose direct children rise in one after another.
export const StaggerChildren = ({ as = "div", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag data-reveal="stagger" {...rest}>
      {children}
    </Tag>
  );
};

// Text split into masked words, so each word can rise out of its own mask.
// Plain inline text to screen readers and search engines.
export const SplitWords = ({ text }) => {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  return words.map((word, i) => (
    <React.Fragment key={`${word}-${i}`}>
      <span className="sw">
        <span className="sw-i" style={{ "--w": i }}>
          {word}
        </span>
      </span>
      {i < words.length - 1 ? " " : null}
    </React.Fragment>
  ));
};

/* ================= PRODUCT CARD ================= */

// A product card with its full entrance: the card fades in, then badges,
// name (word by word), description, rating, price and buttons follow.
export const ProductCard = ({ as = "div", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag data-reveal="card" {...rest}>
      {children}
    </Tag>
  );
};

/* ================= BUTTONS ================= */

// Buttons dip slightly while pressed (CSS :active in motion.css).
export const PressButton = ({ children, ...rest }) => <button {...rest}>{children}</button>;
