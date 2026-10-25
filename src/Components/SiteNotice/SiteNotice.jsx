import React, { useCallback, useEffect, useRef, useState } from "react";
import { isSiteNoticePending, markSiteNoticeSeen } from "./siteNoticeStore";
import { FaWhatsapp } from "react-icons/fa";
import "./SiteNotice.css";

const WHATSAPP_NUMBER = "917080512292"; // same number as the footer and Contact page
const INTRO_KEY = "shyam_intro_seen"; // set by SiteMotion when the splash ends

// "Site under construction — please don't order or pay yet" pop-up, shown
// once per visit, after the first-visit splash has lifted.
const SiteNotice = () => {
  const [open, setOpen] = useState(false);
  const okRef = useRef(null);

  const close = useCallback(() => {
    markSiteNoticeSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!isSiteNoticePending()) return undefined;
    // wait for the splash (it sets INTRO_KEY when done) so the two never overlap
    const timer = setInterval(() => {
      let introDone = true;
      try {
        introDone = Boolean(sessionStorage.getItem(INTRO_KEY)) || !document.documentElement.classList.contains("intro");
      } catch {
        /* storage blocked: show it anyway */
      }
      if (introDone) {
        clearInterval(timer);
        setOpen(true);
      }
    }, 300);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    okRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="sn-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sn-dialog" role="alertdialog" aria-modal="true" aria-labelledby="sn-title" aria-describedby="sn-body">
        <span className="sn-badge">Under construction</span>
        <h2 id="sn-title" className="sn-title">
          We're getting ready 🚧
        </h2>

        <div id="sn-body">
          <p className="sn-text">
            Our new website is still under construction. Please <strong>don't place orders or make any payments</strong>{" "}
            here yet. They may not be processed.
          </p>
          <p className="sn-text">
            All information on the site right now (products, prices, offers and other details) is{" "}
            <strong>tentative</strong> and may change.
          </p>
          <p className="sn-text sn-hindi" lang="hi-Latn">
            Hamari nayi website abhi ban rahi hai. Kripya abhi koi <strong>order ya payment (transaction)</strong> na
            karein. Website par di gayi saari jaankari (products, daam, offers) abhi <strong>tentative</strong> hai aur
            badal sakti hai.
          </p>
          <p className="sn-help">
            Want to order today? Call or WhatsApp us at <a href="tel:+917080512292">+91 70805 12292</a>.
          </p>
        </div>

        <div className="sn-actions">
          <a
            className="sn-btn sn-btn-ghost"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Shyam Namkeen & Bakers, I'd like to place an order.")}`}
            target="_blank"
            rel="noreferrer"
          >
            <FaWhatsapp aria-hidden="true" /> WhatsApp us
          </a>
          <button ref={okRef} type="button" className="sn-btn sn-btn-primary" onClick={close}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteNotice;
