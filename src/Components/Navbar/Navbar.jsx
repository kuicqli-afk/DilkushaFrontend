import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation, href } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Navbar.css";

import { FaSearch, FaUser, FaBox, FaSignOutAlt, FaChevronDown, FaUserEdit, FaCheck, FaPlus, FaBookmark, FaExclamationCircle, FaLeaf } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import shyam from "../../assets/syam.png";
import profile from "../../assets/profile.gif";
import cart from "../../assets/cart.gif";
import chatIcon from "../../assets/chat.png"

const API_URL = "https://backend.shyamnamkeenandbakers.online/api";

const PLACEHOLDERS = [
  "Search for Shyam Bakers & Namkeen, a cuisine, or a dish…",
  "Search for patties",
  "Search for cookies",
  "Search for pizza",
  "Search for cake",
  "Search for namkeens",
  "Search for sev",
];

const getProductStock = (product) => {
  if (product.quantity === undefined || product.quantity === null || product.quantity === "") {
    return Infinity;
  }
  return Number(product.quantity) || 0;
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchDropdownRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Categories state for bottom navbar strip
  const [navCategories, setNavCategories] = useState([]);

  const dropdownRef = useRef(null);

  const count = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const direction = useRef("typing");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchDropdown(true);

    const timer = setTimeout(() => {
      axios
        .get(`${API_URL}/products/search`, { params: { q: searchValue.trim() } })
        .then((res) => {
          setSearchResults(res.data.products || []);
        })
        .catch((err) => {
          console.error("Search Error:", err);
          setSearchResults([]);
        })
        .finally(() => setSearchLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue]);

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
          textIndex.current = (textIndex.current + 1) % PLACEHOLDERS.length;
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isInputActive]);

  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  // 🆕 Added outside click listener to close user profile dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  useEffect(() => {
    const fetchFollowData = () => {
      if (isAuthenticated && user?._id) {
        axios
          .get(`${API_URL}/follow/status/${user._id}`)
          .then((res) => {
            if (res.data.success) {
              setIsFollowing(res.data.following);
              setFollowersCount(res.data.followersCount);
            }
          })
          .catch((err) => console.error("Follow Status Error:", err));
      } else {
        axios
          .get(`${API_URL}/follow/count`)
          .then((res) => {
            if (res.data.success) {
              setFollowersCount(res.data.followersCount);
            }
          })
          .catch((err) => console.error("Follow Count Error:", err));
        setIsFollowing(false);
      }
    };

    fetchFollowData();

    const handleFollowChange = () => {
      fetchFollowData();
    };

    window.addEventListener("follow-status-changed", handleFollowChange);

    axios
      .get(`${API_URL}/products/count`)
      .then((res) => {
        if (res.data.success) {
          setTotalProducts(res.data.count);
        }
      })
      .catch((err) => console.error("Product Count Error:", err));

    axios
      .get(`${API_URL}/category/categories`)
      .then((res) => {
        const categoryData = res.data.categories || res.data.data || res.data || [];
        const visibleCategories = categoryData.filter((cat) => !cat.hidden);
        setNavCategories(visibleCategories);
      })
      .catch((err) => console.error("Navbar Categories Error:", err));

    return () => {
      window.removeEventListener("follow-status-changed", handleFollowChange);
    };
  }, [isAuthenticated, user]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirectTo=${encodeURIComponent(currentPath)}&intent=follow`);
      return;
    }

    if (followLoading) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        const res = await axios.delete(`${API_URL}/follow/${user._id}`);
        if (res.data.success) {
          setIsFollowing(false);
          setFollowersCount(res.data.followersCount);
          window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: false } }));
        }
      } else {
        const res = await axios.post(`${API_URL}/follow`, { userId: user._id });
        if (res.data.success) {
          setIsFollowing(true);
          setFollowersCount(res.data.followersCount);
          window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: true } }));
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

  const handleSearchResultClick = (product) => {
    const stock = getProductStock(product);
    if (stock <= 0) {
      alert("This item is currently out of stock.");
      return;
    }

    setShowSearchDropdown(false);
    setIsInputActive(false);
    setSearchValue("");
    navigate("/order", { state: { item: product } });
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleCategoryClick = (item) => {
    navigate(`/category/${encodeURIComponent(item.name)}`);
  };

  return (
    <div className={`nav-container ${isScrolled ? "nav-scrolled" : ""}`}>
      {/* ================= MAIN NAVBAR ROW ================= */}
      <div className="nav-main-row">
        {/* LEFT : Logo + Location + Search */}
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

          <div className="search-box" ref={searchDropdownRef}>
            <FaSearch className="search-icon" />

            <div className="typing-wrapper">
              {!isInputActive && (
                <span className="typing-erase">{displayText}</span>
              )}

              <input
                type="text"
                value={searchValue}
                onFocus={() => {
                  setIsInputActive(true);
                  if (searchValue.trim()) setShowSearchDropdown(true);
                }}
                onBlur={() => {
                  if (!searchValue) setIsInputActive(false);
                }}
                onChange={handleSearch}
              />
            </div>

            {/* SEARCH RESULTS DROPDOWN */}
            {showSearchDropdown && (
              <div className="search-dropdown">
                {searchLoading ? (
                  <div className="search-dropdown-status">
                    <span className="search-spinner" />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-dropdown-header">
                      {searchResults.length} result{searchResults.length === 1 ? "" : "s"} found
                    </div>
                    <div className="search-results-list">
                      {searchResults.map((product) => {
                        const inStock = getProductStock(product) > 0;
                        const hasOffer = product.offer > 0 && product.offer < product.price;

                        return (
                          <div
                            key={product._id}
                            className={`search-result-item ${!inStock ? "out-of-stock" : ""}`}
                            onClick={() => handleSearchResultClick(product)}
                          >
                            <div className="search-result-img-wrap">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="search-result-img"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                                }}
                              />
                              {!inStock && <span className="search-result-oos-badge">Out of Stock</span>}
                            </div>

                            <div className="search-result-info">
                              <span className="search-result-title">{product.title}</span>
                              <div className="search-result-price-row">
                                <span className="search-result-price">
                                  ₹{hasOffer ? product.offer : product.price}
                                </span>
                                {hasOffer && (
                                  <span className="search-result-mrp">₹{product.price}</span>
                                )}
                                {product.off > 0 && (
                                  <span className="search-result-off">{product.off}% OFF</span>
                                )}
                              </div>
                            </div>

                            <span className="search-result-arrow">›</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="search-dropdown-status no-results">
                    <FaExclamationCircle size={22} />
                    <p>No products found for <strong>"{searchValue}"</strong></p>
                    <span>Try checking the spelling or search something else</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT : Vegetarian toggle + Products/Follow | Account | Cart */}
        <div className="nav-right">

          <span className="chat" onClick={() => {
            window.open("https://dtalkbusiness.designerbirds.com/",
              "_blank",
              "noopener,noreferrer"
            );
          }} style={{ cursor: "pointer" }}>
            <img src={chatIcon} alt="Chat" />
          </span>

          <span className="veg-badge">
            <FaLeaf size={12} />
            <span className="veg-badge-text">Pure Veg</span>
          </span>

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
                    {user?.name.slice(0, 15) || user?.phone || "Account"}
                  </span>
                  <FaChevronDown className="dropdown-arrow" />
                </div>

                {showDropdown && (
                  <div className="nav-dropdown-menu">
                    <div className="dropdown-item" onClick={() => { setShowDropdown(false); navigate("/profile"); }}>
                      <FaUserEdit /> Update Profile
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowDropdown(false); navigate("/wishlist"); }}>
                      <FaBookmark /> Wishlist
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowDropdown(false); navigate("/orders"); }}>
                      <FaBox /> My Orders
                    </div>

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

      {/* ================= BOTTOM CATEGORY NAMES STRIP ================= */}
      <div className="nav-category-strip">
        <div className="nav-category-scroll">
          {navCategories.map((item) => (
            <span
              key={item._id}
              className="nav-category-name-item"
              onClick={() => handleCategoryClick(item)}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;