import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiPhone, FiUser, FiLock, FiArrowRight, FiRotateCw } from "react-icons/fi";
import "./LoginPage.css";

const BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "https://shyamfoodbackend.onrender.com/api";

const LoginPage = () => {
  // Destructure 'login' instead of 'setUser'
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

    if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/user/send-otp`, {
        name: name.trim(),
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
        name: name.trim(),
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

  // VERIFY OTP FUNCTION FIX
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const cleanOtp = otp.trim();

    if (!cleanPhone || !cleanOtp) {
      setError("Please enter OTP.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/user/verify-otp`, {
        name: name.trim(),
        phone: cleanPhone,
        otp: cleanOtp,
      });

      if (res.data?.success && res.data?.token) {
        // AuthContext ke login function me User Data aur Token pass karein
        login(res.data.user, res.data.token);

        // Smooth navigation to profile
        navigate("/profile", { replace: true });
      } else {
        setError(res.data?.message || "Invalid OTP.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{step === 1 ? "Welcome Back" : "Verify OTP"}</h2>
        <p>
          {step === 1
            ? "Enter your details to receive an OTP code"
            : `Enter the code sent to +91 ${phone}`}
        </p>

        {error && <div className="error-banner">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  maxLength="10"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending OTP..." : "Get OTP"} <FiArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp">One Time Password (OTP)</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
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
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              disabled={loading}
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;