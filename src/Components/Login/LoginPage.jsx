import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiPhone, FiLock, FiArrowRight, FiRotateCw, FiCheck } from "react-icons/fi";
import "./LoginPage.css";
import { SuccessCheck } from "../Motion/SuccessCheck";
import { digitsOnly, validateOtp, validatePhone } from "../../utils/validation";
import Dilkusha from "../../assets/dilkusha.png";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://dilkushabackend.onrender.com/api";

// how long the "signed in" tick shows before we move on (SuccessCheck runs ~1.3s)
const SUCCESS_HOLD_MS = 1500;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  // inline message under the phone / OTP field
  const [fieldError, setFieldError] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");

    const cleanPhone = phone.trim().replace(/\D/g, "");

    const phoneError = validatePhone(cleanPhone);
    if (phoneError) {
      setFieldError(phoneError);
      document.getElementById("phone")?.focus();
      return;
    }
    setFieldError("");

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/user/send-otp`, {
        phone: cleanPhone,
      });

      if (res.data?.success) {
        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        setError(res.data?.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;

    setError("");
    setResending(true);

    const cleanPhone = phone.trim().replace(/\D/g, "");

    try {
      const res = await axios.post(`${BASE_URL}/user/send-otp`, {
        phone: cleanPhone,
      });

      if (res.data?.success) {
        setOtp("");
        setTimer(60);
        setCanResend(false);
      } else {
        setError(res.data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Error resending OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const cleanOtp = otp.trim();

    const otpError = validateOtp(cleanOtp, 4);
    if (!cleanPhone || otpError) {
      setFieldError(otpError || "Please go back and enter your mobile number.");
      document.getElementById("otp")?.focus();
      return;
    }
    setFieldError("");

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/user/verify-otp`, {
        phone: cleanPhone,
        otp: cleanOtp,
      });

      if (res.data?.success && res.data?.token) {
        await login(res.data.user, res.data.token);

        const searchParams = new URLSearchParams(location.search);
        const redirectTo = searchParams.get("redirectTo") || location.state?.from?.pathname || "/profile";
        // let the success tick play, then move on
        setSignedIn(true);
        redirectTimer.current = setTimeout(() => navigate(redirectTo, { replace: true }), SUCCESS_HOLD_MS);
      } else {
        setError(res.data?.message || "Invalid OTP.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  if (signedIn) {
    return (
      <div className="login-container" data-no-reveal>
        <div className="login-card login-success" role="status" aria-live="polite">
          <SuccessCheck size={104} label="Signed in" />
          <h2>You're signed in!</h2>
          <p>Welcome to Dilkusha Biryani. Taking you there…</p>
          <span className="login-success-bar" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" data-no-reveal>
      <div className="login-card">
        <img className="login-logo" src={Dilkusha} alt="Dilkusha Biryani" width="460" height="260" />

        {/* keyed by step so each step plays its entrance */}
        <div key={step} className="login-step">
          {step === 2 && (
            <span className="otp-sent-pill">
              <FiCheck aria-hidden="true" /> OTP sent
            </span>
          )}
          <h2>{step === 1 ? "Welcome Back" : "Verify OTP"}</h2>
          <p>
            {step === 1
              ? "Enter your mobile number to receive an OTP code"
              : `Enter the code sent to +91 ${phone}`}
          </p>

          {error && (
            <div key={error} className="error-banner" role="alert">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <div className={`input-wrapper ${fieldError ? "is-invalid" : ""}`}>
                  <FiPhone className="input-icon" />
                  <span className="phone-prefix" aria-hidden="true">+91</span>
                  <input
                    id="phone"
                    className="phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength="10"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(digitsOnly(e.target.value, 10));
                      if (fieldError) setFieldError("");
                    }}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby={fieldError ? "login-field-error" : undefined}
                  />
                </div>
                {fieldError && (
                  <small key={fieldError} id="login-field-error" className="login-field-error" role="alert">
                    {fieldError}
                  </small>
                )}
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" /> Sending OTP…
                  </>
                ) : (
                  <>
                    Get OTP <FiArrowRight size={18} className="btn-arrow" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp">One Time Password (OTP)</label>
                <div className={`input-wrapper ${fieldError ? "is-invalid" : ""}`}>
                  <FiLock className="input-icon" />
                  <input
                    id="otp"
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter OTP"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => {
                      setOtp(digitsOnly(e.target.value, 4));
                      if (fieldError) setFieldError("");
                    }}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby={fieldError ? "login-field-error" : undefined}
                    autoFocus
                  />
                </div>
                {fieldError && (
                  <small key={fieldError} id="login-field-error" className="login-field-error" role="alert">
                    {fieldError}
                  </small>
                )}
              </div>

              <div className="otp-timer-row">
                <span className="timer-text">
                  {timer > 0 ? (
                    <>
                      Resend OTP in <strong>00:{timer < 10 ? `0${timer}` : timer}</strong>
                    </>
                  ) : (
                    "Didn't receive code?"
                  )}
                </span>

                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOtp}
                  disabled={!canResend || resending}
                >
                  <FiRotateCw className={resending ? "spin-icon" : ""} />
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" /> Verifying…
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setFieldError("");
                }}
                disabled={loading}
              >
                Change Mobile Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;