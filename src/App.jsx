import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation, Outlet, Router } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

import Navbar from "./Components/Navbar/Navbar.jsx";
import Category from "./Components/Category/Category";
import Footer from "./Components/Footer/Footer";



import { ScrollToTopButton } from "./Components/ScrollToTopButton/ScrollToTopButton.jsx";
import ScrollToTop from "./Components/ScrollToTopButton/ScrollToTop";


import AdsSlider from "./Components/Slider/AdsSlider.jsx";



import MaidaItems from "./Components/Food/MaidaItems.jsx";

import DynamicSlider from "./Components/Slider/DynamicSlider.jsx";

import FeedbackWatcher from "./Components/Feedback/FeedbackWatcher.jsx";
import { lazy, Suspense } from 'react'
import PageTransition from "./Components/Motion/PageTransition.jsx";
import SiteMotion from "./Components/Motion/SiteMotion.jsx";
import SiteNotice from "./Components/SiteNotice/SiteNotice.jsx";
import { ProductGridSkeleton, ProductRowSkeleton } from "./Components/Skeleton/Skeleton.jsx";
import Seo from "./Components/Seo/Seo.jsx";
const BASE_URL = import.meta.env?.VITE_API_URL || "https://backend.shyamnamkeenandbakers.online/api";


// Pages load on demand so the home page doesn't download checkout, PDF and
// listing code up front.
const LoginPage = lazy(() => import("./Components/Login/LoginPage.jsx"));
const OrderPage = lazy(() => import("./Components/OrderPage/OrderPage.jsx"));
const RestaurantPage = lazy(() => import("./Components/ShopsDetailPage/RestaurantPage.jsx"));
const Khuramnagar = lazy(() => import("./Components/Pages/Khuramnagar.jsx"));
const Indiranagar = lazy(() => import("./Components/Pages/Indiranagar.jsx"));
const Nishatganj = lazy(() => import("./Components/Pages/Nishatganj.jsx"));
const Aliganj = lazy(() => import("./Components/Pages/Aliganj.jsx"));
const Kapoorthala = lazy(() => import("./Components/Pages/Kapoorthala.jsx"));
const Aminabad = lazy(() => import("./Components/Pages/Aminabad.jsx"));
const Gomtinagar = lazy(() => import("./Components/Pages/Gomtinagar.jsx"));
const Alambagh = lazy(() => import("../src/Components/Pages/Alambagh.jsx"));
const Daliganj = lazy(() => import("./Components/Pages/Daliganj.jsx"));
const Kalyanpur = lazy(() => import("./Components/Pages/Kalyanpur.jsx"));
const CartPage = lazy(() => import("./Components/Cart/Cart.jsx"));
const CheckoutPage = lazy(() => import("./Components/CheckoutPage/CheckoutPage.jsx"));
const OfferDetails = lazy(() => import("./Components/Pages/OfferDetails.jsx"));
const ShyamBakery = lazy(() => import("./Components/ShopsDetailPage/ShyamBakery.jsx"));
const ShaymChips = lazy(() => import("./Components/ShopsDetailPage/ShaymChips.jsx"));
const AllShopsSlider = lazy(() => import("./Components/ShopAllSlider/AllShopsSlider.jsx"));
const ShyamSev = lazy(() => import("./Components/ShopsDetailPage/ShyamSev.jsx"));
const ShaymBhujiya = lazy(() => import("./Components/ShopsDetailPage/ShaymBhujiya.jsx"));
const KajuNamkeen = lazy(() => import("./Components/ViewAll/KajuNamkeen.jsx"));
const SingleItemAll = lazy(() => import("./Components/ViewAll/SingleItems.jsx"));
const SingleItems = lazy(() => import("./Components/ShopsDetailPage/SingleItems.jsx"));
const MixAll = lazy(() => import("./Components/ViewAll/MixAll.jsx"));
const ChuraAll = lazy(() => import("./Components/ViewAll/Chura.jsx"));
const ChipsAll = lazy(() => import("./Components/ViewAll/ChipsAll.jsx"));
const BhujiyaAll = lazy(() => import("./Components/ViewAll/BhujiyaAll.jsx"));
const SevAll = lazy(() => import("./Components/ViewAll/SevAll.jsx"));
const PastryAll = lazy(() => import("./Components/ViewAll/PastryAll.jsx"));
const CakeAll = lazy(() => import("./Components/ViewAll/CakeAll.jsx"));
const CookiesAll = lazy(() => import("./Components/ViewAll/CookiesAll.jsx"));
const ItemsAll = lazy(() => import("./Components/ViewAll/Items.jsx"));
const OffersAll = lazy(() => import("./Components/ViewAll/OffersAll.jsx"));
const WeekendSpecial = lazy(() => import("./Components/ViewAll/WeekendSpecial.jsx"));
const DiscountOffer = lazy(() => import("./Components/DiscountOffer/DiscountOffer.jsx"));
const Slider = lazy(() => import("./Components/Slider/Slider"));
const CategoryPage = lazy(() => import("./Components/Category/CategoryPage.jsx"));
const AllOffersProducts = lazy(() => import("./Components/Food/AllOffersProducts.jsx"));
const OrderHistory = lazy(() => import("./Components/CheckoutPage/OrderHistory.jsx"));
const ProfilePage = lazy(() => import("./Components/Login/ProfilePage.jsx"));
const ItemsSectionProducts = lazy(() => import("./Components/Food/ItemsSectionProducts.jsx"));
const WishlistPage = lazy(() => import("./Components/Wishlist/Wishlist.jsx"));
const TermsAndConditions = lazy(() => import("./Components/Legal/TermsAndConditions.jsx"));
const PrivacyPolicy = lazy(() => import("./Components/Legal/PrivacyPolicy.jsx"));
const ShippingPolicy = lazy(() => import("./Components/Legal/ShippingPolicy.jsx"));
const ContactUs = lazy(() => import("./Components/Legal/ContactUs.jsx"));
const AboutUs = lazy(() => import("./Components/Legal/AboutUs.jsx"));

const BecomeRider = lazy(() =>
  import('./Components/Footer/RiderConnect').then((m) => ({ default: m.BecomeRiderPage }))
)

// 🆕 Fisher-Yates shuffle — randomizes category-section order on every fresh page load/refresh
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Set global Axios Authorization header automatically if a token exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Axios response interceptor to clear auth on 401 Unauthorized or auth failure
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.status === 403 ||
      (error?.response?.status === 404 && error?.config?.url?.includes("/user/profile")) ||
      (error?.response?.status === 500 && error?.config?.url?.includes("/user/profile"))
    ) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-logout"));
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SiteMotion />
        <SiteNotice />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

const RouteFallback = () => (
  <div className="food-container" style={{ paddingTop: "30px" }}>
    <ProductGridSkeleton count={4} />
  </div>
);

const MainLayout = () => (
  <>
    <ScrollToTop />
    <ScrollToTopButton />
    <FeedbackWatcher />
    <Navbar />
    <Seo />
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </PageTransition>
    <Footer />
  </>
);

function AppContent() {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [price, setPrice] = useState("");
  const [cuisine, setCuisine] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const location = useLocation();

  // Categories fetch
  useEffect(() => {
    axios
      .get(`${BASE_URL}/category/categories`)
      .then((res) => {
        const categoryData = res.data.categories || res.data.data || res.data || [];

        // Fix top category 
        const pinnedCategories = categoryData.filter((cat) => cat.isPinned);
        const unpinnedCategories = categoryData.filter((cat) => !cat.isPinned);

        const orderedCategories = [...pinnedCategories, ...shuffleArray(unpinnedCategories)];
        const names = orderedCategories.map((cat) => cat.name || cat.title);
        setCategories(names); // 🆕 random category-section order every page load
      })
      .catch((err) => console.error("Categories fetch error:", err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Smooth scroll handler
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        const el = document.getElementById(location.state.scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [location]);

  return (
    <Routes>
      <Route
        path="/become-a-rider"
        element={<Suspense fallback={null}><BecomeRider /></Suspense>}
      />
      <Route element={<MainLayout />}>
        {/* Auth & User Account Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <DynamicSlider />
              <Category onSelectCategory={setSelectedCategory} />
              {/* <Button
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                price={price}
                setPrice={setPrice}
                cuisine={cuisine}
                setCuisine={setCuisine}
              /> */}
              {/* <AllOffer /> */}

              {categoriesLoading && (
                <>
                  <ProductRowSkeleton />
                  <ProductRowSkeleton />
                </>
              )}

              {categories.map((item) => (
                <div key={item}>
                  <MaidaItems
                    category={item}
                    categoryId={selectedCategory}
                    filter={filter}
                    sortBy={sortBy}
                    price={price}
                    cuisine={cuisine}
                  />
                  <AdsSlider category={item} />
                </div>
              ))}

              {/* <Items tag="trending" title="Hot & Trending Food Offers" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <Items tag="combo" title="Combo Deals" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <Items tag="weekend-special" title="Weekend Special" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} /> */}
              {/* <Offers /> is off: it calls an old backend (shyambackend.onrender.com)
                  that now refuses requests, so it never showed anything and only
                  logged console errors. Point it at the current API to bring it back. */}
              {/* <AppBanner /> */}
            </>
          }
        />

        <Route path="/section/:tag" element={<ItemsSectionProducts />} />

        {/* E-Commerce Operations */}
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        {/* Protected Checkout & History */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        {/* Restaurant & Location Pages */}
        <Route path="/restaurant" element={<RestaurantPage />} />
        <Route path="/restaurant/khuramnagar" element={<Khuramnagar />} />
        <Route path="/restaurant/indiranagar" element={<Indiranagar />} />
        <Route path="/restaurant/nishatganj" element={<Nishatganj />} />
        <Route path="/restaurant/aliganj" element={<Aliganj />} />
        <Route path="/restaurant/kapoorthala" element={<Kapoorthala />} />
        <Route path="/restaurant/aminabad" element={<Aminabad />} />
        <Route path="/restaurant/gomtinagar" element={<Gomtinagar />} />
        <Route path="/restaurant/alambagh" element={<Alambagh />} />
        <Route path="/restaurant/daliganj" element={<Daliganj />} />
        <Route path="/restaurant/kalyanpur" element={<Kalyanpur />} />

        {/* Offers & Details */}
        <Route path="/offers/:slug" element={<AllOffersProducts />} />
        <Route path="/offer-details/:slug" element={<OfferDetails />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping-and-delivery" element={<ShippingPolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/about-us" element={<AboutUs />} />

        <Route
          path="/become-a-rider"
          element={<Suspense fallback={null}><BecomeRider /></Suspense>}
        />

        <Route
          path="/discount"
          element={
            <>
              <Slider />
              <DiscountOffer />
            </>
          }
        />

        <Route
          path="/restaurant-detail/:id"
          element={
            <>
              <AllShopsSlider />
              <ShyamBakery />
              <ShaymChips />
              <ShyamSev />
              <ShaymBhujiya />
              <SingleItems />
            </>
          }
        />

        {/* Category Browsing */}
        <Route path="/category/:categoryCode" element={<CategoryPage />} />
        <Route path="/category/:categoryCode/:subCategoryCode" element={<CategoryPage />} />

        {/* Product Collection / View All Listings */}
        <Route path="/all-knamkeenaju-" element={<><Slider /><KajuNamkeen /></>} />
        <Route path="/all-mix-namkeen" element={<><Slider /><MixAll /></>} />
        <Route path="/all-single-items" element={<><Slider /><SingleItemAll /></>} />
        <Route path="/all-chura" element={<><Slider /><ChuraAll /></>} />
        <Route path="/all-chips" element={<><Slider /><ChipsAll /></>} />
        <Route path="/all-bhujiya" element={<><Slider /><BhujiyaAll /></>} />
        <Route path="/all-sev" element={<><Slider /><SevAll /></>} />
        <Route path="/all-pastry" element={<><Slider /><PastryAll /></>} />
        <Route path="/all-cake" element={<><Slider /><CakeAll /></>} />
        <Route path="/all-cookies" element={<><Slider /><CookiesAll /></>} />
        <Route path="/all-items" element={<><Slider /><ItemsAll /></>} />
        <Route path="/all-offers" element={<><Slider /><OffersAll /></>} />
        <Route path="/weekend-specials" element={<><Slider /><WeekendSpecial /></>} />
      </Route>
    </Routes>
  );
}

export default App;