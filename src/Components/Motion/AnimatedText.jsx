import React from "react";
import { SplitWords } from "./motionKit";
import "./motion.css";

// A heading that rises in word by word when it scrolls into view.
// Screen readers get the plain text; the split spans are hidden from them.
const AnimatedText = ({ as = "h1", text, ...rest }) => {
  const Tag = as;
  const value = text == null ? "" : String(text);

  return (
    <Tag data-reveal="words" aria-label={value} {...rest}>
      <span aria-hidden="true">
        <SplitWords text={value} />
      </span>
    </Tag>
  );
};

export default AnimatedText;
