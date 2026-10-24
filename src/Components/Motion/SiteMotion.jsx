import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pageopener } from "./Pageopener";
import { startRevealObserver } from "./revealObserver";

const INTRO_KEY = "shyam_intro_seen";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the opening animation plays once per browser session, not on every refresh
const shouldPlayIntro = () => {
  if (prefersReducedMotion()) return false;
  try {
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return true;
  }
};

// Site-wide motion: first-visit opener, page curtain and the scroll progress bar.
// Scrolling itself is the browser's native scrolling on purpose: it runs off
// the main thread, so it stays smooth while product cards load and animate.
// (A JavaScript smooth-scroll library made scrolling stutter whenever the
// page was busy.)
const SiteMotion = () => {
  const { pathname } = useLocation();
  const [reduceMotion] = useState(prefersReducedMotion);
  const [intro, setIntro] = useState(shouldPlayIntro);
  const [curtainPath, setCurtainPath] = useState(null);
  const [lastPath, setLastPath] = useState(pathname);
  const barRef = useRef(null);

  // PAGE CURTAIN — decided during render, so it mounts in the same commit as
  // the new page and the page never flashes uncovered for a frame
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (!reduceMotion && !intro) setCurtainPath(pathname);
  }

  // one observer reveals every [data-reveal] element on the site
  useEffect(() => startRevealObserver(), []);

  // the static splash in index.html is only needed when the intro takes over from it
  useEffect(() => {
    if (!intro) document.getElementById("boot")?.remove();
  }, [intro]);

  // LOCK SCROLL WHILE THE OPENING ANIMATION PLAYS
  useEffect(() => {
    document.body.style.overflow = intro ? "hidden" : "";
  }, [intro]);

  // SCROLL PROGRESS BAR
  // Browsers with scroll-driven animations draw it entirely in CSS (no
  // JavaScript on scroll at all; see .scroll-progress in Pageopener.css).
  // Elsewhere: one scroll read per frame, page height measured only on resize.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || CSS.supports?.("animation-timeline: scroll()")) return undefined;
    let max = 0;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
        bar.style.transform = `scaleX(${progress})`;
      });
    };
    const observer = new ResizeObserver(() => {
      max = document.documentElement.scrollHeight - window.innerHeight;
      update();
    });
    observer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  const finishIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* private mode: the intro may simply play again next time */
    }
    setIntro(false);
  };

  return (
    <>
      <div className="scroll-progress" ref={barRef} aria-hidden="true" />
      {intro && <Pageopener variant="intro" onDone={finishIntro} />}
      {curtainPath && <Pageopener key={curtainPath} variant="route" onDone={() => setCurtainPath(null)} />}
    </>
  );
};

export default SiteMotion;
