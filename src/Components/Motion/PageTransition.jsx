import React from "react";
import { useLocation } from "react-router-dom";
import "./motion.css";

// Re-keys on the pathname so every route change plays the entrance once.
// Query/hash changes on the same page don't replay it.
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
