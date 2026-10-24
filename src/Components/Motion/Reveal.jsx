import React from "react";
import "./motion.css";

// A block that animates in the first time it scrolls into view.
// variant "up" rises in; "fade" only fades (for rows whose cards bring
// their own motion). Children with className="reveal-item" and
// style={{ "--i": index }} stagger in after it.
const Reveal = ({ as = "div", variant = "up", children, ...rest }) => {
  const Tag = as;
  return (
    <Tag data-reveal={variant} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
