import React, { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import "./ScrollToTopButton.css";
import { scrollToTop as smoothScrollToTop } from "../Motion/lenisStore";
import { useScrolledPast } from "../Motion/useScrolledPast";

// How far the button must rise so it never covers the footer's bottom line
// (copyright / "Designed and developed by"). Watched with an
// IntersectionObserver, so nothing runs while scrolling.
const useFooterLift = () => {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    let observer;
    let frame = 0;
    const attach = () => {
      const bar = document.querySelector(".footer-bottom-bar");
      if (!bar) {
        frame = requestAnimationFrame(attach); // footer not rendered yet
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          // rise by however much of the bar is on screen
          setLift(entry.isIntersecting ? Math.round(entry.intersectionRect.height) : 0);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      observer.observe(bar);
    };
    attach();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return lift;
};

export const ScrollToTopButton = () => {
  // shown once the visitor is 300px down (no layout reads on scroll)
  const isVisible = useScrolledPast(300);
  const lift = useFooterLift();

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top"
      style={{ "--lift": `${lift}px` }}
      onClick={() => smoothScrollToTop()}
      aria-label="Back to top"
    >
      <FiArrowUp aria-hidden="true" />
    </button>
  );
};
