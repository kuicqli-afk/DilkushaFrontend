// Scroll helpers shared by the scroll-to-top button and route changes.
// Clicks glide (html has scroll-behavior: smooth); route changes jump
// instantly, hidden under the page curtain.
export const scrollToTop = ({ immediate = false } = {}) => {
  window.scrollTo({ top: 0, behavior: immediate ? "instant" : "smooth" });
};
