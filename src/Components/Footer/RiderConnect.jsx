import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaTimes,
    FaRegCopy,
    FaCheck,
    FaDownload,
    FaMotorcycle,
    FaUser,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaHome,
    FaLock,
    FaCheckCircle,
} from "react-icons/fa";

// The QR library is loaded only when a QR is actually shown
const QRCodeCanvas = lazy(() =>
    import("qrcode.react").then((m) => ({ default: m.QRCodeCanvas }))
);

/* ================================
   CONFIG
================================ */

// QR must always point to the live domain (never localhost).
// To test on your phone before deploying, set VITE_SITE_URL in .env (e.g. http://192.168.1.5:5173)
const SITE_URL = import.meta.env?.VITE_SITE_URL || "https://shyamnamkeenandbakers.online";

// Existing Kuicqli backend. Riders are saved with role "driver", so they appear in
// Kuicqli admin -> Application Requests -> Drivers.
const JOIN_API_URL = "https://backend.kuicqli.com/join-applications";

// Fixed name of this website. It is sent with every application and cannot be changed by the user.
const SOURCE_WEBSITE = "Shyam Namkeen & Bakers";
const REQUEST_TIMEOUT_MS = 15000;

const FIELDS = [
    { key: "name", label: "Full name", type: "text", placeholder: "Your full name", autoComplete: "name", icon: FaUser },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email", icon: FaEnvelope },
    { key: "phone", label: "Mobile number", type: "tel", placeholder: "10-digit mobile number", autoComplete: "tel-national", icon: FaPhoneAlt },
    { key: "location", label: "City / area", type: "text", placeholder: "e.g. Gomti Nagar", autoComplete: "address-level2", icon: FaMapMarkerAlt },
    { key: "address", label: "Full address", type: "textarea", placeholder: "House no, street, landmark", autoComplete: "street-address", icon: FaHome },
];

/* ================================
   HELPERS
================================ */

function validate(values) {
    const errors = {};

    FIELDS.forEach(({ key, label }) => {
        const value = (values[key] || "").trim();

        if (!value) {
            errors[key] = `${label} is required`;
            return;
        }
        if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[key] = "Enter a valid email address";
        }
        if (key === "phone" && !/^[6-9]\d{9}$/.test(value)) {
            errors[key] = "Enter a valid 10-digit mobile number";
        }
    });

    return errors;
}

async function submitRiderApplication(values) {
    const payload = { role: "driver" };
    FIELDS.forEach(({ key }) => {
        payload[key] = (values[key] || "").trim();
    });
    // Which website the request came from (fixed value, see SOURCE_WEBSITE)
    payload.sourceWebsite = SOURCE_WEBSITE;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(JOIN_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        let data = null;
        try {
            data = await response.json();
        } catch {
            // not JSON, handled below
        }

        if (!response.ok) {
            const error = new Error(data?.message || "Could not submit your application. Please try again.");
            error.fieldErrors = data?.errors || null;
            throw error;
        }

        return data;
    } catch (err) {
        if (err.name === "AbortError") throw new Error("The server took too long to respond. Please try again.");
        if (err instanceof TypeError) throw new Error("Network error. Check your connection and try again.");
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

// Escape key closes the popup, and the page behind it stops scrolling
function useModalBehavior(onClose) {
    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [onClose]);
}

/* ================================
   SHARED UI
================================ */

function Styles() {
    return <style>{CSS}</style>;
}

function Header({ title, subtitle, onClose }) {
    return (
        <div className="rc-head">
            <span className="rc-head__badge" aria-hidden="true">
                <FaMotorcycle />
            </span>
            <div className="rc-head__text">
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
            {onClose && (
                <button type="button" className="rc-head__close" onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>
            )}
        </div>
    );
}

function Modal({ title, subtitle, onClose, children }) {
    useModalBehavior(onClose);

    return (
        <div className="rc-overlay" onClick={onClose}>
            <Styles />
            <div
                className="rc-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <Header title={title} subtitle={subtitle} onClose={onClose} />
                <div className="rc-body">{children}</div>
            </div>
        </div>
    );
}

// Website name row: fixed, cannot be edited
function BrandNameField({ label }) {
    return (
        <div className="rc-brand">
            <span className="rc-brand__label">{label}</span>
            <div className="rc-brand__view">
                <strong>{SOURCE_WEBSITE}</strong>
                <FaLock className="rc-brand__lock" aria-label="Fixed" />
            </div>
        </div>
    );
}

/* ================================
   RIDER FORM (used by popup and by the QR page)
================================ */

function RiderForm({ onFinish, finishLabel = "Close" }) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (key, rawValue) => {
        // phone: digits only, max 10 (+91 is fixed in the UI)
        const value = key === "phone" ? rawValue.replace(/\D/g, "").slice(0, 10) : rawValue;

        setValues((prev) => ({ ...prev, [key]: value }));
        setSubmitError("");
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const nextErrors = validate(values);
        setErrors(nextErrors);
        setSubmitError("");
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);

        try {
            const result = await submitRiderApplication(values);
            setSuccessMessage(result?.message || "Application submitted. Our team will call you soon.");
        } catch (err) {
            if (err.fieldErrors) {
                const serverErrors = {};
                FIELDS.forEach(({ key }) => {
                    if (err.fieldErrors[key]) serverErrors[key] = err.fieldErrors[key];
                });
                setErrors(serverErrors);
            }
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (successMessage) {
        return (
            <div className="rc-success" role="status">
                <FaCheckCircle className="rc-success__icon" aria-hidden="true" />
                <h3>Application received</h3>
                <p>{successMessage}</p>
                {onFinish && (
                    <button type="button" className="rc-btn" onClick={onFinish}>
                        {finishLabel}
                    </button>
                )}
            </div>
        );
    }

    return (
        <form className="rc-form" onSubmit={handleSubmit} noValidate>
            <BrandNameField label="Request from website" />

            <div className="rc-grid">
                {FIELDS.map(({ key, label, type, placeholder, autoComplete, icon: Icon }) => {
                    const id = `rc-${key}`;
                    const error = errors[key];
                    const wide = key === "name" || key === "email" || key === "address";
                    const common = {
                        id,
                        name: key,
                        placeholder,
                        autoComplete,
                        value: values[key] || "",
                        disabled: submitting,
                        onChange: (e) => handleChange(key, e.target.value),
                        "aria-invalid": !!error,
                        "aria-describedby": error ? `${id}-error` : undefined,
                    };

                    return (
                        <div className={`rc-field ${wide ? "rc-field--wide" : ""}`} key={key}>
                            <label htmlFor={id}>{label}</label>

                            <div className={`rc-input ${error ? "rc-input--error" : ""} ${type === "textarea" ? "rc-input--area" : ""}`}>
                                <Icon className="rc-input__icon" aria-hidden="true" />
                                {key === "phone" && <span className="rc-input__prefix">+91</span>}
                                {type === "textarea" ? (
                                    <textarea {...common} rows={3} />
                                ) : (
                                    <input {...common} type={type} inputMode={key === "phone" ? "numeric" : undefined} />
                                )}
                            </div>

                            {error && (
                                <span className="rc-error" id={`${id}-error`}>
                                    {error}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {submitError && (
                <p className="rc-alert" role="alert">
                    {submitError}
                </p>
            )}

            <button type="submit" className="rc-btn" disabled={submitting} aria-busy={submitting}>
                {submitting ? "Sending…" : "Send application"}
            </button>
            <p className="rc-note">Our team will call you on this number to complete the onboarding.</p>
        </form>
    );
}

/* ================================
   EXPORT 1: footer popup "Become a Rider"
================================ */

export function RiderModal({ onClose }) {
    return (
        <Modal
            title="Become a Rider"
            subtitle="Join our delivery team. Takes less than a minute."
            onClose={onClose}
        >
            <RiderForm onFinish={onClose} finishLabel="Close" />
        </Modal>
    );
}

/* ================================
   EXPORT 2: footer popup "Connect with Riders" (QR)
================================ */

export function RiderQrModal({ onClose }) {
    const [copied, setCopied] = useState(false);
    const qrWrapRef = useRef(null);

    const formUrl = `${SITE_URL}/become-a-rider`;

    const handleDownload = () => {
        const canvas = qrWrapRef.current?.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "become-a-rider-qr.png";
        link.click();
    };

    const handleCopy = () => {
        navigator.clipboard
            .writeText(formUrl)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => { });
    };

    return (
        <Modal
            title="Become a riders partner"
            subtitle="Riders scan this QR to open the application form."
            onClose={onClose}
        >
            <div className="rc-qr">
                <BrandNameField label="Request from website" />

                <div className="rc-qr__frame" ref={qrWrapRef}>
                    <Suspense fallback={<div className="rc-qr__skeleton" />}>
                        <QRCodeCanvas value={formUrl} size={220} level="M" includeMargin />
                    </Suspense>
                </div>

                <ol className="rc-steps">
                    <li>Scan the QR with the phone camera</li>
                    <li>Fill in the rider form</li>
                    <li>Our team calls you back</li>
                </ol>

                <div className="rc-qr__actions">
                    <button type="button" className="rc-outline" onClick={handleDownload}>
                        <FaDownload aria-hidden="true" /> Download QR
                    </button>
                    <button type="button" className="rc-outline" onClick={handleCopy}>
                        {copied ? <FaCheck aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
                        {copied ? "Link copied" : "Copy link"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

/* ================================
   EXPORT 3: page opened by scanning the QR (route: /become-a-rider)
================================ */

export function BecomeRiderPage() {
    const navigate = useNavigate();

    return (
        <div className="rc-page">
            <Styles />
            <div className="rc-card">
                <Header title="Become a Rider" subtitle="Fill in your details and our team will contact you." />
                <div className="rc-body">
                    <RiderForm onFinish={() => navigate("/")} finishLabel="Back to website" />
                </div>
            </div>
        </div>
    );
}

/* ================================
   STYLES (scoped with rc- prefix, no extra CSS file needed)
================================ */

const CSS = `
.rc-overlay, .rc-page, .rc-overlay *, .rc-page * { box-sizing: border-box; }

.rc-overlay, .rc-page {
  --rc-ink: #241915;
  --rc-muted: #6f625c;
  --rc-line: #e3dbd6;
  --rc-surface: #ffffff;
  --rc-soft: #f6f3f1;
  --rc-brand: #7a1d2e;
  --rc-brand-dark: #5f1423;
  --rc-accent: #f0b429;
  --rc-danger: #b42318;
  --rc-ok: #1f7a4d;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--rc-ink);
}

/* ---------- containers ---------- */
.rc-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 16px; background: rgba(20, 10, 8, .55);
  overflow-y: auto;
}
.rc-dialog, .rc-card {
  width: 100%; max-width: 480px;
  background: var(--rc-surface); border-radius: 18px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(20, 10, 8, .28);
  text-align: left;
}
.rc-dialog { max-height: calc(100vh - 32px); display: flex; flex-direction: column; }
.rc-dialog .rc-body { overflow-y: auto; }
.rc-dialog { animation: rc-pop .18s ease-out; }
@keyframes rc-pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }

.rc-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px 16px; background: var(--rc-soft);
}
.rc-card { max-width: 520px; }
.rc-body { padding: 22px 22px 24px; }

/* ---------- header ---------- */
.rc-head {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; background: var(--rc-brand); color: #fff;
  border-bottom: 4px solid var(--rc-accent);
}
.rc-head__badge {
  flex: none; width: 46px; height: 46px; border-radius: 12px;
  display: grid; place-items: center; font-size: 22px;
  background: var(--rc-accent); color: var(--rc-brand-dark);
}
.rc-head__text { flex: 1; min-width: 0; }
.rc-head__text h2 { margin: 0; font-size: 20px; line-height: 1.25; font-weight: 700; color: #fff; }
.rc-head__text p { margin: 3px 0 0; font-size: 13.5px; line-height: 1.4; color: rgba(255,255,255,.82); }
.rc-head__close {
  flex: none; width: 36px; height: 36px; border: 0; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer;
  background: rgba(255,255,255,.14); color: #fff; font-size: 15px;
}
.rc-head__close:hover { background: rgba(255,255,255,.26); }

/* ---------- website name row ---------- */
.rc-brand {
  margin-bottom: 18px; padding: 12px 14px;
  border: 1px solid var(--rc-line); border-radius: 12px; background: var(--rc-soft);
}
.rc-brand__label { display: block; margin-bottom: 4px; font-size: 12.5px; color: var(--rc-muted); }
.rc-brand__view { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.rc-brand__view strong { font-size: 15.5px; font-weight: 650; overflow-wrap: anywhere; }
.rc-brand__lock { flex: none; font-size: 13px; color: var(--rc-muted); }
.rc-link {
  display: inline-flex; align-items: center; gap: 6px; flex: none;
  border: 0; background: none; padding: 4px 2px; cursor: pointer;
  font: inherit; font-size: 14px; font-weight: 600; color: var(--rc-brand);
}
.rc-link svg { font-size: 11px; }
.rc-link:hover { text-decoration: underline; }
.rc-link--muted { color: var(--rc-muted); font-weight: 500; }

/* ---------- form ---------- */
.rc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 12px; }
.rc-field { min-width: 0; }
.rc-field--wide { grid-column: 1 / -1; }
.rc-field label { display: block; margin-bottom: 6px; font-size: 13.5px; font-weight: 600; }

.rc-input {
  display: flex; align-items: center; gap: 10px;
  padding: 0 12px; background: #fff;
  border: 1.5px solid var(--rc-line); border-radius: 10px;
  transition: border-color .15s, box-shadow .15s;
}
.rc-input:focus-within { border-color: var(--rc-brand); box-shadow: 0 0 0 3px rgba(122, 29, 46, .14); }
.rc-input--error { border-color: var(--rc-danger); }
.rc-input--error:focus-within { border-color: var(--rc-danger); box-shadow: 0 0 0 3px rgba(180, 35, 24, .14); }
.rc-input--area { align-items: flex-start; }
.rc-input--area .rc-input__icon { margin-top: 15px; }
.rc-input__icon { flex: none; font-size: 14px; color: var(--rc-muted); }
.rc-input__prefix {
  flex: none; padding-right: 10px; border-right: 1px solid var(--rc-line);
  font-size: 15px; line-height: 44px; color: var(--rc-muted);
}
.rc-input input, .rc-input textarea {
  flex: 1; min-width: 0; width: 100%; border: 0; outline: 0; background: transparent;
  font: inherit; font-size: 15px; color: var(--rc-ink);
}
.rc-input input { height: 44px; }
.rc-input textarea { padding: 11px 0; resize: vertical; min-height: 78px; }
.rc-input input::placeholder, .rc-input textarea::placeholder { color: #a79b94; }
.rc-input input:disabled, .rc-input textarea:disabled { opacity: .6; }

.rc-error { display: block; margin-top: 5px; font-size: 12.5px; color: var(--rc-danger); }
.rc-alert {
  margin: 16px 0 0; padding: 10px 12px; font-size: 14px;
  color: var(--rc-danger); background: #fdecea; border: 1px solid #f5c2bd; border-radius: 10px;
}

.rc-btn {
  display: block; width: 100%; margin-top: 18px; padding: 14px;
  border: 0; border-radius: 12px; cursor: pointer;
  background: var(--rc-brand); color: #fff;
  font: inherit; font-size: 16px; font-weight: 650; text-align: center;
  transition: background .15s;
}
.rc-btn:hover:not(:disabled) { background: var(--rc-brand-dark); }
.rc-btn:disabled { opacity: .65; cursor: not-allowed; }
.rc-note { margin: 10px 0 0; font-size: 12.5px; text-align: center; color: var(--rc-muted); }

/* ---------- success ---------- */
.rc-success { padding: 10px 0 2px; text-align: center; }
.rc-success__icon { font-size: 54px; color: var(--rc-ok); }
.rc-success h3 { margin: 12px 0 6px; font-size: 20px; }
.rc-success p { margin: 0; font-size: 15px; line-height: 1.55; color: var(--rc-muted); }

/* ---------- QR popup ---------- */
.rc-qr { text-align: center; }
.rc-qr .rc-brand { text-align: left; }
.rc-qr__frame {
  display: inline-block; min-width: 244px; min-height: 244px; padding: 10px;
  background: #fff; border: 1.5px solid var(--rc-line); border-radius: 16px;
  outline: 4px solid var(--rc-accent); outline-offset: -1px;
}
.rc-qr__frame canvas { display: block; max-width: 100%; height: auto !important; }
.rc-qr__skeleton { width: 220px; height: 220px; border-radius: 8px; background: var(--rc-soft); }

.rc-steps {
  margin: 18px auto 16px; padding: 0 0 0 20px; max-width: 320px;
  text-align: left; font-size: 14px; line-height: 1.9; color: var(--rc-muted);
}
.rc-qr__actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }
.rc-outline {
  display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px;
  border: 1.5px solid var(--rc-brand); border-radius: 10px; background: #fff; cursor: pointer;
  font: inherit; font-size: 14px; font-weight: 600; color: var(--rc-brand);
}
.rc-outline:hover { background: var(--rc-brand); color: #fff; }

/* ---------- focus + motion ---------- */
.rc-btn:focus-visible, .rc-outline:focus-visible, .rc-link:focus-visible, .rc-head__close:focus-visible {
  outline: 3px solid var(--rc-accent); outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .rc-dialog { animation: none; }
  .rc-input, .rc-btn { transition: none; }
}

/* ---------- small screens ---------- */
@media (max-width: 480px) {
  .rc-grid { grid-template-columns: 1fr; }
  .rc-body { padding: 18px 16px 20px; }
  .rc-head { padding: 16px; }
  .rc-qr__frame { min-width: 0; }
}
`;