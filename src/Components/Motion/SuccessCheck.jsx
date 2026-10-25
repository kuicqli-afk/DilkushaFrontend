import React from "react";
import "./SuccessCheck.css";

const SPARK_COLOURS = ["var(--chilli)", "var(--kesar)", "var(--pista)"];
const SPARKS = Array.from({ length: 8 }, (_, i) => ({
  angle: `${i * 45 + 22}deg`,
  colour: SPARK_COLOURS[i % SPARK_COLOURS.length],
}));

// Animated "done" mark for order placed / signed in: the circle draws,
// fills, the tick strokes in, then a ring and a few sparks burst out once.
export const SuccessCheck = ({ size = 104, label = "Success" }) => (
  <div className="success-check" style={{ "--sc-size": `${size}px` }} role="img" aria-label={label}>
    <span className="sc-ring" aria-hidden="true" />
    {SPARKS.map((spark) => (
      <span
        key={spark.angle}
        className="sc-spark"
        aria-hidden="true"
        style={{ "--a": spark.angle, "--c": spark.colour }}
      />
    ))}
    <svg className="sc-svg" viewBox="0 0 52 52" aria-hidden="true">
      <circle className="sc-circle" cx="26" cy="26" r="24" />
      <path className="sc-tick" d="M15 27 l7.5 7.5 L38 19" />
    </svg>
  </div>
);

export default SuccessCheck;
