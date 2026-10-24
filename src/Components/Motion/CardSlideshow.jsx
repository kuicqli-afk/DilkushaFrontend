import React, { useEffect, useRef, useState } from "react";
import { RevealImage } from "./motionKit";
import "./motion.css";

const SLIDE_EVERY_MS = 2600;

// A product card's photo, cycling through the product's photos.
// Each card runs its own timer — only while it is on screen and the tab is
// visible — so a tick re-renders this one card, not every card in the row.
// The next photo is downloaded and decoded before the swap, and the old one
// fades out on top of it: a crossfade, never a blank flash.
const CardSlideshow = ({ images, alt, className }) => {
  const frameRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState(null); // { src, key } fading away
  const [onScreen, setOnScreen] = useState(false);
  const count = images.length;

  // run only while the card is visible
  useEffect(() => {
    const frame = frameRef.current?.parentElement;
    if (!frame || count < 2) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(frame);
    return () => observer.disconnect();
  }, [count]);

  const goTo = (next) => {
    if (next === index) return;
    const img = new Image();
    img.src = images[next];
    img
      .decode()
      .catch(() => {})
      .then(() => {
        setOutgoing({ src: images[index], key: `${index}-${Date.now()}` });
        setIndex(next);
      });
  };

  useEffect(() => {
    if (!onScreen || count < 2) return undefined;
    const timer = setTimeout(() => {
      if (!document.hidden) goTo((index + 1) % count);
    }, SLIDE_EVERY_MS);
    return () => clearTimeout(timer);
    // goTo is recreated each render; index/onScreen/count drive the schedule
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, onScreen, count]);

  return (
    <>
      <span ref={frameRef} hidden />
      <RevealImage src={images[index] || ""} alt={alt} loading="lazy" decoding="async" className={className} />
      {outgoing && (
        <img
          key={outgoing.key}
          src={outgoing.src}
          alt=""
          aria-hidden="true"
          className={`${className} card-slide-out`}
          onAnimationEnd={() => setOutgoing(null)}
        />
      )}
      {count > 1 && (
        <div className="card-dots-container">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`card-dot ${idx === index ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                goTo(idx);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CardSlideshow;
