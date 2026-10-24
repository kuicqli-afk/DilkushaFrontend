// One IntersectionObserver for the whole site. Any element with a
// data-reveal attribute — rendered now or later — is marked data-revealed
// the first time it scrolls into view; motion.css does the animating.
// (data-revealed rather than a class: React never touches it, so a
// re-render can't hide an element that has already appeared.)
//
// It also gives every page's plain text its entrance automatically: headings,
// paragraphs and list items inside the routed page content (.page-transition)
// are tagged data-reveal="text", so pages need no animation code of their own.
// Anything interactive or already animated is left alone.

const SELECTOR = "[data-reveal]";
const PAGE_ROOT = ".page-transition";
const AUTO_TEXT = "h1, h2, h3, h4, p, li, blockquote";
// never auto-hide text inside these: it must be there the instant it appears
const SKIP_INSIDE =
  "[data-reveal], [data-no-reveal], form, button, label, a, input, select, textarea, [role='dialog'], [role='menu'], [role='status'], .swiper, nav, header, footer";

const tagAutoText = (root) => {
  if (root.nodeType !== 1) return;
  const page = root.closest?.(PAGE_ROOT) || (root.matches?.(PAGE_ROOT) ? root : root.querySelector?.(PAGE_ROOT));
  if (!page) return;
  const candidates = root.matches(AUTO_TEXT) ? [root] : [];
  candidates.push(...root.querySelectorAll(AUTO_TEXT));
  for (const el of candidates) {
    if (el.hasAttribute("data-reveal") || !el.closest(PAGE_ROOT)) continue;
    // skip nested text (a <p> inside an <li> animates with the <li>)
    if (el.parentElement?.closest(AUTO_TEXT)) continue;
    if (el.parentElement?.closest(SKIP_INSIDE)) continue;
    el.setAttribute("data-reveal", "text");
  }
};

export const startRevealObserver = () => {
  if (typeof IntersectionObserver === "undefined" || typeof MutationObserver === "undefined") {
    const revealAll = () => document.querySelectorAll(SELECTOR).forEach((el) => el.setAttribute("data-revealed", ""));
    revealAll();
    const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(revealAll);
    mo?.observe(document.body, { childList: true, subtree: true });
    return () => mo?.disconnect();
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-revealed", "");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  );

  const watched = new WeakSet();
  const watch = (el) => {
    if (watched.has(el) || el.hasAttribute("data-revealed")) return;
    watched.add(el);
    io.observe(el);
  };
  const scan = (node) => {
    if (node.nodeType !== 1) return;
    tagAutoText(node);
    if (node.matches(SELECTOR)) watch(node);
    node.querySelectorAll(SELECTOR).forEach(watch);
  };

  scan(document.body);
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) m.addedNodes.forEach(scan);
  });
  mo.observe(document.body, { childList: true, subtree: true });

  return () => {
    io.disconnect();
    mo.disconnect();
  };
};
