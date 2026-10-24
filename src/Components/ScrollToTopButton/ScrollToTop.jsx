import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollToTop } from "../Motion/lenisStore";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // jump straight up: the page curtain covers the move
    scrollToTop({ immediate: true });
  }, [pathname]);
  return null;
}

export default ScrollToTop;