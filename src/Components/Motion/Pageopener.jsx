import React, { useLayoutEffect, useRef } from "react";
import logo from "../../assets/syam.webp";
import "./Pageopener.css";

// Same feel as the Designerbirds opener, but on the native Web Animations API
// (no GSAP download) and with shorter timings for a shop people browse a lot.
//
// variant="intro" -> first visit: the logo wipes in (or carries on from the
//                    #boot splash in index.html), holds, then the panel lifts
//                    away with a curved bottom edge.
// variant="route" -> quick curtain while moving between pages.

const EASE_OUT = "cubic-bezier(0.33, 1, 0.68, 1)";
const EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const EASE_EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";

export const Pageopener = ({ variant = "route", onDone }) => {
  const root = useRef(null);
  // was the HTML logo splash (index.html #boot) on screen when this mounted?
  const fromBoot = useRef(variant === "intro" && !!document.getElementById("boot"));
  const doneRef = useRef(onDone);
  useLayoutEffect(() => {
    doneRef.current = onDone;
  });

  useLayoutEffect(() => {
    const el = root.current;
    const panel = el.querySelector(".po-panel");
    const content = el.querySelector(".po-content");
    const mark = el.querySelector(".po-logo");
    const line = el.querySelector(".po-line");
    const anims = [];
    const play = (node, frames, options) => {
      const a = node.animate(frames, { fill: "both", ...options });
      anims.push(a);
      return a;
    };

    let liftAt;
    let liftFor;

    if (fromBoot.current) {
      // logo is already on screen from the HTML splash: carry on from it
      document.getElementById("boot")?.remove();
      // kept short: on a first visit the splash covers the page, and the
      // sooner it lifts the sooner the shop is usable (and measured as such)
      play(line, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 350, easing: EASE_OUT });
      liftAt = 350;
      liftFor = 800;
    } else if (variant === "intro") {
      play(
        mark,
        [
          { clipPath: "inset(100% 0% 0% 0%)", transform: "scale(0.92)" },
          { clipPath: "inset(0% 0% 0% 0%)", transform: "none" },
        ],
        { duration: 800, delay: 150, easing: EASE_OUT }
      );
      play(line, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 600, delay: 200, easing: EASE_OUT });
      liftAt = 800;
      liftFor = 850;
    } else {
      play(mark, [{ clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }], {
        duration: 380,
        easing: EASE_OUT,
      });
      liftAt = 380;
      liftFor = 850;
    }

    play(
      content,
      [
        { transform: "none", opacity: 1 },
        { transform: "translateY(-18%)", opacity: 0 },
      ],
      { duration: liftFor * 0.6, delay: liftAt, easing: EASE_IN_OUT }
    );
    const lift = play(panel, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], {
      duration: liftFor,
      delay: liftAt,
      easing: EASE_EXPO_IN_OUT,
    });

    lift.finished.then(() => doneRef.current?.()).catch(() => {});
    return () => anims.forEach((a) => a.cancel());
  }, [variant]);

  return (
    <div ref={root} className={`page-opener ${variant}`} role="status" aria-label="Loading">
      <div className="po-panel">
        <div className="po-content">
          <img className="po-logo" src={logo} alt="" />
          {variant === "intro" && <span className="po-line" />}
        </div>
      </div>
    </div>
  );
};

export default Pageopener;
