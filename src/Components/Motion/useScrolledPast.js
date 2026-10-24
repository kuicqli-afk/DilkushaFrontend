import { useEffect, useState } from "react";

// True once the page is scrolled more than `px` down.
// Watches an invisible marker with IntersectionObserver instead of reading
// window.scrollY in a scroll handler: that read forces a layout on every
// scroll frame while animations are writing styles, which made scrolling jerk.
export const useScrolledPast = (px) => {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const marker = document.createElement("div");
    marker.setAttribute("aria-hidden", "true");
    marker.style.cssText = `position:absolute;top:${px}px;left:0;width:1px;height:1px;pointer-events:none;visibility:hidden;`;
    document.body.appendChild(marker);

    const observer = new IntersectionObserver(([entry]) => {
      // marker gone off the top of the screen => scrolled past it
      setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(marker);

    return () => {
      observer.disconnect();
      marker.remove();
    };
  }, [px]);

  return past;
};
