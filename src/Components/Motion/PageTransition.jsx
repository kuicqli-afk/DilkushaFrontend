import React from "react";
import { useLocation } from "react-router-dom";
import "./motion.css";

// Re-keys on the pathname so every route change plays the entrance once.
// Query/hash changes on the same page don't replay it. It is also the
// page's <main> landmark, so screen readers can jump straight to content.
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <main key={pathname} className="page-transition">
      {children}
    </main>
  );
};

export default PageTransition;
