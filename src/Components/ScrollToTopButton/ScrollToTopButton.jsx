import React from "react";
import "./ScrollToTopButton.css";
import { scrollToTop as smoothScrollToTop } from "../Motion/lenisStore";
import { useScrolledPast } from "../Motion/useScrolledPast";

export const ScrollToTopButton = () => {
  // shown once the visitor is 300px down (no layout reads on scroll)
  const isVisible = useScrolledPast(300);

  // glides up (CSS scroll-behavior: smooth)
  const scrollToTop = () => smoothScrollToTop();

  return (
    <div>
      {isVisible && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
         &#x21E1;
        </button>
      )}
    </div>
  );
};


