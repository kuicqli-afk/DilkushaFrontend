import React from "react";
import "../Motion/motion.css";

// Placeholder shapes that match the real food cards, so nothing jumps when data lands.

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <span className="skeleton skeleton-card-image" />
    <div className="skeleton-card-body">
      <span className="skeleton skeleton-line sm" />
      <span className="skeleton skeleton-line lg" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line sm" />
      <div className="skeleton-actions">
        <span className="skeleton skeleton-btn" />
        <span className="skeleton skeleton-btn" />
      </div>
    </div>
  </div>
);

// One horizontal product row, as on the home page
export const ProductRowSkeleton = ({ count = 5, showHeading = true }) => (
  <div className="food-container" role="status" aria-label="Loading products">
    {showHeading && <span className="skeleton skeleton-heading" />}
    <div className="skeleton-row">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

// Grid of product cards, as on category / section / offer pages.
// Rendered inside an existing .food-container.
export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="food-card-grid" role="status" aria-label="Loading products">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Round category bubbles under the slider
export const CategorySkeleton = ({ count = 10 }) => (
  <div className="skeleton-categories" role="status" aria-label="Loading categories">
    {Array.from({ length: count }, (_, i) => (
      <div className="skeleton-category" key={i}>
        <span className="skeleton skeleton-circle" />
        <span className="skeleton skeleton-line" />
      </div>
    ))}
  </div>
);

// Single product detail page
export const ProductDetailSkeleton = () => (
  <div className="skeleton-detail" role="status" aria-label="Loading product">
    <span className="skeleton skeleton-detail-image" />
    <div className="skeleton-card-body">
      <span className="skeleton skeleton-line lg" />
      <span className="skeleton skeleton-line sm" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line sm" />
      <div className="skeleton-actions">
        <span className="skeleton skeleton-btn" />
        <span className="skeleton skeleton-btn" />
      </div>
    </div>
  </div>
);

// A few lines of text (footer lists, shop info, short paragraphs)
export const TextLinesSkeleton = ({ lines = 3, label = "Loading" }) => (
  <div className="skeleton-lines" role="status" aria-label={label}>
    {Array.from({ length: lines }, (_, i) => (
      <span key={i} className={`skeleton skeleton-line${i === lines - 1 ? " sm" : ""}`} />
    ))}
  </div>
);

// A short shimmer that sits inline with text (a price or fee still loading)
export const InlineSkeleton = ({ width = "4em" }) => (
  <span className="skeleton skeleton-inline" style={{ width }} role="status" aria-label="Loading" />
);

// A generic page: title, intro and content blocks (account pages, details)
export const PageSkeleton = () => (
  <div className="skeleton-page" role="status" aria-label="Loading page">
    <span className="skeleton skeleton-heading" />
    <TextLinesSkeleton lines={2} />
    <div className="skeleton-blocks">
      <span className="skeleton skeleton-block" />
      <span className="skeleton skeleton-block" />
    </div>
  </div>
);

// The customer's orders list
export const OrderListSkeleton = ({ count = 3 }) => (
  <div className="skeleton-page" role="status" aria-label="Loading your orders">
    <span className="skeleton skeleton-heading" />
    {Array.from({ length: count }, (_, i) => (
      <div className="skeleton-order" key={i}>
        <span className="skeleton skeleton-thumb" />
        <div className="skeleton-order-body">
          <span className="skeleton skeleton-line lg" />
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line sm" />
        </div>
      </div>
    ))}
  </div>
);

// Customer reviews on the product page
export const ReviewsSkeleton = ({ count = 2 }) => (
  <div className="skeleton-reviews" role="status" aria-label="Loading reviews">
    {Array.from({ length: count }, (_, i) => (
      <div className="skeleton-review" key={i}>
        <span className="skeleton skeleton-avatar" />
        <TextLinesSkeleton lines={2} />
      </div>
    ))}
  </div>
);
