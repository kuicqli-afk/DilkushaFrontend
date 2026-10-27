import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/AuthContext";
import "./Navbar.css";
import {
  FaSearch,
  FaUser,
  FaBox,
  FaSignOutAlt,
  FaChevronDown,
  FaUserEdit,
  FaCheck,
  FaPlus,
  FaBookmark,
  FaExclamationCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaShoppingCart,
  FaComments,
  FaChevronRight,
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import Dilkusha from "../../assets/dilkusha.png";
import profile from "../../assets/profile.webp";
import cart from "../../assets/cart.webp";
import chatIcon from "../../assets/chat.png";
import { optimizeImage } from "../../utils/image";
import { useScrolledPast } from "../Motion/useScrolledPast";

const API_URL = "http://localhost:5001/api";

const PLACEHOLDERS = [
  "Search for chicken biryani or mutton biryani…",
  "Search for chicken tikka",
  "Search for butter chicken",
  "Search for chicken kebab",
  "Search for mutton curry",
  "Search for chicken rolls",
  "Search for fish fry",
  "Search for egg curry",
  "Search for tandoori chicken",
  "Search for chicken burgers",
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

  // watched without reading scrollY on every scroll (that caused jerky scrolling)
  const isScrolled = useScrolledPast(10);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Categories state for bottom navbar strip + full-screen menu
  const [navCategories, setNavCategories] = useState([]);

  // Mobile full-screen menu
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const count = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const direction = useRef("typing");



  // Close menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Menu: lock page scroll, close on Esc, close if screen grows to desktop
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    if (menuOpen) window.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

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

  // Close user profile dropdown when clicking anywhere outside
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
      setMenuOpen(false);
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
    setMenuOpen(false);
    navigate("/");
  };

  const handleCategoryClick = (item) => {
    setMenuOpen(false);
    navigate(`/category/${encodeURIComponent(item.name)}`);
  };

  const handleChatClick = () => {
    const chatUrl = isAuthenticated
      ? "https://dtalkbusiness.designerbirds.com/chat"
      : "https://dtalkbusiness.designerbirds.com/";
    window.open(chatUrl, "_blank", "noopener,noreferrer");
    setMenuOpen(false);
  };

  // Menu helpers
  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };
  const isActive = (path) => location.pathname === path;

  const displayName = user?.name || user?.phone || "Account";
  const avatarLetter = (user?.name || user?.phone || "A").toString().trim().charAt(0).toUpperCase();

  return (
    <>
      <div className={`nav-container ${isScrolled ? "nav-scrolled" : ""}`}>
        {/* ================= MAIN NAVBAR ROW =================
            Desktop : [Logo | Location | Search] ............ [Chat | Veg | Stats | Account | Cart]
            Mobile  : Row 1 -> [Logo] ............ [Cart | Menu]
                      Row 2 -> [ ----------- full-width Search ----------- ]
        */}
        <div className="nav-main-row">
          {/* LEFT : Logo + Location + Search */}
          <div className="nav-left">
            <Link to="/" className="nav-logo-link" style={{ textDecoration: "none" }}>
              <img className="logo-text" src={Dilkusha} alt="Dilkusha Biryani" width="460" height="260" fetchPriority="high" />
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
                  aria-label="Search products"
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
                                  src={optimizeImage(product.image, 160)}
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

          {/* RIGHT : Chat | Vegetarian | Products/Follow | Account | Cart | Hamburger (mobile) */}
          <div className="nav-right">
            {/* <span
              className="chat"
              onClick={handleChatClick}
              style={{ cursor: "pointer" }}
              title={isAuthenticated ? "Open Chat" : "Login to Chat"}
            >
              <img src={chatIcon} alt="Chat" />
            </span> */}
            <span className="veg-badge" title="Non Vegetarian">
              <span className="nonveg-mark" aria-hidden="true" />
              <span className="veg-badge-text">Non Veg</span>
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
                  className="nav-item nav-user-item user-dropdown-container"
                  ref={dropdownRef}
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <div className="user-profile-badge">
                    <FaUser className="user-icon" />
                    <span className="user-name">
                      {(user?.name || user?.phone || "Account").slice(0, 15)}
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
                <li className="nav-item nav-user-item" onClick={() => navigate("/login")}>
                  <img src={profile} alt="" width="64" height="64" />
                  Login
                </li>
              )}

              <li className="nav-item nav-cart">
                <Link to="/cart" className="nav-link" aria-label={`Cart, ${count} items`}>
                  <img src={cart} alt="" width="64" height="64" />
                  <span className="cart-count">{count}</span>
                </Link>
              </li>
            </ul>

            <button
              type="button"
              className="nav-hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <FaBars />
            </button>
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

      {/* ================= FULL-SCREEN MOBILE MENU (outside .nav-container on purpose) ================= */}
      <aside
        id="mobile-drawer"
        className={`mobile-drawer ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Main menu"
      >
        <div className="drawer-header">
          <Link to="/" onClick={() => setMenuOpen(false)} className="drawer-logo-link">
            <img className="drawer-logo" src={Dilkusha} alt="Dilkusha Biryani" width="460" height="260" />
          </Link>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="drawer-body">
          {/* Account card */}
          {isAuthenticated ? (
            <div
              className="drawer-user-card"
              onClick={() => goTo("/profile")}
              role="button"
              tabIndex={0}
            >
              <span className="drawer-avatar">{avatarLetter}</span>
              <div className="drawer-user-info">
                <span className="drawer-user-name">{displayName}</span>
                <span className="drawer-user-sub">View and update profile</span>
              </div>
              <FaChevronRight className="drawer-user-arrow" />
            </div>
          ) : (
            <div className="drawer-guest-card">
              <div>
                <span className="drawer-guest-title">Welcome</span>
                <span className="drawer-guest-sub">Log in to track orders and save your wishlist</span>
              </div>
              <button type="button" className="drawer-login-btn" onClick={() => goTo("/login")}>
                Log in
              </button>
            </div>
          )}

          {/* Main links */}
          <nav className="drawer-section">
            <button
              type="button"
              className={`drawer-link ${isActive("/") ? "active" : ""}`}
              onClick={() => goTo("/")}
            >
              <span className="drawer-link-icon"><FaHome /></span>
              <span className="drawer-link-text">Home</span>
            </button>

            <button
              type="button"
              className={`drawer-link ${isActive("/cart") ? "active" : ""}`}
              onClick={() => goTo("/cart")}
            >
              <span className="drawer-link-icon"><FaShoppingCart /></span>
              <span className="drawer-link-text">My Cart</span>
              {count > 0 && <span className="drawer-link-badge">{count}</span>}
            </button>

            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className={`drawer-link ${isActive("/orders") ? "active" : ""}`}
                  onClick={() => goTo("/orders")}
                >
                  <span className="drawer-link-icon"><FaBox /></span>
                  <span className="drawer-link-text">My Orders</span>
                </button>

                <button
                  type="button"
                  className={`drawer-link ${isActive("/wishlist") ? "active" : ""}`}
                  onClick={() => goTo("/wishlist")}
                >
                  <span className="drawer-link-icon"><FaBookmark /></span>
                  <span className="drawer-link-text">Wishlist</span>
                </button>

                <button
                  type="button"
                  className={`drawer-link ${isActive("/profile") ? "active" : ""}`}
                  onClick={() => goTo("/profile")}
                >
                  <span className="drawer-link-icon"><FaUserEdit /></span>
                  <span className="drawer-link-text">Update Profile</span>
                </button>
              </>
            )}

            <button type="button" className="drawer-link" onClick={handleChatClick}>
              <span className="drawer-link-icon"><FaComments /></span>
              <span className="drawer-link-text">Chat with us</span>
            </button>
          </nav>

          {/* Categories — all of them, in a 2-column grid */}
          {navCategories.length > 0 && (
            <div className="drawer-section">
              <p className="drawer-section-title">Shop by category</p>
              <div className="drawer-category-list">
                {navCategories.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    className="drawer-category-item"
                    onClick={() => handleCategoryClick(item)}
                  >
                    <span>{item.name}</span>
                    <FaChevronRight />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Store info */}
          <div className="drawer-store-card">
            <div className="drawer-store-top">
              <span className="drawer-store-loc">
                <FaLocationDot /> Lucknow City
              </span>
              <span className="drawer-veg">
                <span className="nonveg-mark" aria-hidden="true" />
                Non Veg
              </span>
            </div>

            <div className="drawer-store-stats">
              <div>
                <strong>{totalProducts}</strong>
                <span>Products</span>
              </div>
              <div>
                <strong>{followersCount}</strong>
                <span>Followers</span>
              </div>
            </div>

            <button
              type="button"
              className={`drawer-follow-btn ${isFollowing ? "following" : ""}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {isFollowing ? (
                <>
                  <FaCheck size={12} /> Following
                </>
              ) : (
                <>
                  <FaPlus size={12} /> Follow us
                </>
              )}
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="drawer-footer">
            <button type="button" className="drawer-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Log out
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;