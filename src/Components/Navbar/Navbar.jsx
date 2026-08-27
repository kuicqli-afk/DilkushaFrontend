import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Navbar.css";

import { FaSearch, FaUser, FaBox, FaSignOutAlt, FaChevronDown, FaUserEdit, FaCheck, FaPlus } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import shyam from "../../assets/syam.png";
import profile from "../../assets/profile.gif";
import cart from "../../assets/cart.gif";

const API_URL = "https://shyamfoodbackend.onrender.com/api";

const PLACEHOLDERS = [
  "Search for Shyam Bakers & Namkeen, a cuisine, or a dish…",
  "Search for patties",
  "Search for cookies",
  "Search for pizza",
  "Search for cake",
  "Search for namkeens",
  "Search for sev",
];

// ✅ Bina login ke unique device pehchan ke liye — ek baar generate hoke localStorage mein save rahega
const getDeviceId = () => {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id =
      (crypto?.randomUUID && crypto.randomUUID()) ||
      `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("deviceId", id);
  }
  return id;
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Follow + Total Products state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const dropdownRef = useRef(null);

  const count = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  /* =============================
  SEARCH ANIMATION
  ============================== */
  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const direction = useRef("typing");

  useEffect(() => {
    if (isInputActive) return;

    const interval = setInterval(() => {
      const text = PLACEHOLDERS[textIndex.current];

      if (direction.current === "typing") {
        charIndex.current++;
        setDisplayText(text.slice(0, charIndex.current));

        if (charIndex.current === text.length) {
          direction.current = "deleting";
        }
      } else {
        charIndex.current--;
        setDisplayText(text.slice(0, charIndex.current));

        if (charIndex.current === 0) {
          direction.current = "typing";
          textIndex.current =
            (textIndex.current + 1) % PLACEHOLDERS.length;
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isInputActive]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Follow status + Total Products fetch (page load par)
  useEffect(() => {
    const deviceId = getDeviceId();

    axios
      .get(`${API_URL}/follow/status/${deviceId}`)
      .then((res) => {
        if (res.data.success) {
          setIsFollowing(res.data.following);
          setFollowersCount(res.data.followersCount);
        }
      })
      .catch((err) => console.error("Follow Status Error:", err));

    axios
      .get(`${API_URL}/products/count`)
      .then((res) => {
        if (res.data.success) {
          setTotalProducts(res.data.count);
        }
      })
      .catch((err) => console.error("Product Count Error:", err));
  }, []);

  // ✅ Follow / Unfollow toggle
  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const deviceId = getDeviceId();

    try {
      if (isFollowing) {
        const res = await axios.delete(`${API_URL}/follow/${deviceId}`);
        if (res.data.success) {
          setIsFollowing(false);
          setFollowersCount(res.data.followersCount);
        }
      } else {
        const res = await axios.post(`${API_URL}/follow`, { deviceId });
        if (res.data.success) {
          setIsFollowing(true);
          setFollowersCount(res.data.followersCount);
        }
      }
    } catch (err) {
      console.error("Follow Toggle Error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsInputActive(value.length > 0);
    localStorage.setItem("search", value);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <div className="nav-container">
      {/* ================= LEFT : Logo + Location + Search ================= */}
      <div className="nav-left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <img className="logo-text" src={shyam} alt="Logo" />
        </Link>

        <ul>
          <li>
            <FaLocationDot />
            <small>LUCKNOW CITY</small>
          </li>
        </ul>

        <div className="search-box">
          <FaSearch className="search-icon" />

          <div className="typing-wrapper">
            {!isInputActive && (
              <span className="typing-erase">{displayText}</span>
            )}

            <input
              type="text"
              value={searchValue}
              onFocus={() => setIsInputActive(true)}
              onBlur={() => {
                if (!searchValue) setIsInputActive(false);
              }}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* ================= RIGHT : Products + Follow | Account | Cart ================= */}
      <div className="nav-right">
        {/* ✅ TOTAL PRODUCTS + FOLLOW — right side */}
        <div className="store-stats">
          <span className="total-products-badge">
            <strong>{totalProducts}</strong> Products
          </span>

          <span className="stats-divider" />

          <button
            className={`follow-btn ${isFollowing ? "following" : ""}`}
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {isFollowing ? (
              <>
                <FaCheck size={11} /> Following
              </>
            ) : (
              <>
                <FaPlus size={11} /> Follow
              </>
            )}
          </button>

          <span className="followers-count">{followersCount} followers</span>
        </div>

        <ul className="nav-list">
          {isAuthenticated ? (
            <li
              className="nav-item user-dropdown-container"
              ref={dropdownRef}
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <div className="user-profile-badge">
                <FaUser className="user-icon" />
                <span className="user-name">
                  {user?.name || user?.phone || "Account"}
                </span>
                <FaChevronDown className="dropdown-arrow" />
              </div>

              {showDropdown && (
                <div className="nav-dropdown-menu">
                  {/* Option to navigate to Profile Update Page */}
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/profile");
                    }}
                  >
                    <FaUserEdit /> Update Profile
                  </div>

                  {/* My Orders */}
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/orders");
                    }}
                  >
                    <FaBox /> My Orders
                  </div>

                  {/* Logout */}
                  <div className="dropdown-item logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </div>
                </div>
              )}
            </li>
          ) : (
            <li className="nav-item" onClick={() => navigate("/login")}>
              <img src={profile} alt="Login" />
              Login
            </li>
          )}

          <Link to="/cart" className="nav-link">
            <li className="nav-item">
              <img src={cart} alt="Cart" /> ({count})
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;