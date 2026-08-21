import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Navbar.css";

import { FaSearch, FaUser, FaBox, FaSignOutAlt, FaChevronDown, FaUserEdit } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import shyam from "../../assets/syam.png";
import profile from "../../assets/profile.gif";
import cart from "../../assets/cart.gif";

const PLACEHOLDERS = [
  "Search for Shyam Bakers & Namkeen, a cuisine, or a dish…",
  "Search for patties",
  "Search for cookies",
  "Search for pizza",
  "Search for cake",
  "Search for namkeens",
  "Search for sev",
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

      <div className="nav-right">
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