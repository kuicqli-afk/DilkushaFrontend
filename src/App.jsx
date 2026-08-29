import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import LoginPage from "./Components/Login/LoginPage.jsx";

import Navbar from "./Components/Navbar/Navbar.jsx";
import Slider from "./Components/Slider/Slider";
import Category from "./Components/Category/Category";
import OrderPage from "./Components/OrderPage/OrderPage.jsx";
import Footer from "./Components/Footer/Footer";

import RestaurantPage from "./Components/ShopsDetailPage/RestaurantPage.jsx";
import Items from "./Components/Food/Items.jsx";
import AppBanner from "./Components/Food/AppBanner.jsx";
import Khuramnagar from "./Components/Pages/Khuramnagar.jsx";
import Indiranagar from "./Components/Pages/Indiranagar.jsx";
import Nishatganj from "./Components/Pages/Nishatganj.jsx";
import Aliganj from "./Components/Pages/Aliganj.jsx";
import Kapoorthala from "./Components/Pages/Kapoorthala.jsx";
import Aminabad from "./Components/Pages/Aminabad.jsx";
import Gomtinagar from "./Components/Pages/Gomtinagar.jsx";
import Alambagh from "../src/Components/Pages/Alambagh.jsx";
import Daliganj from "./Components/Pages/Daliganj.jsx";
import Kalyanpur from "./Components/Pages/Kalyanpur.jsx";
import CartPage from "./Components/Cart/Cart.jsx";
import CheckoutPage from "./Components/CheckoutPage/CheckoutPage.jsx";

import Button from "./Components/Food/Button.jsx";
import Offers from "./Components/Food/Offers.jsx";

import { ScrollToTopButton } from "./Components/ScrollToTopButton/ScrollToTopButton.jsx";
import ScrollToTop from "./Components/ScrollToTopButton/ScrollToTop";


import AdsSlider from "./Components/Slider/AdsSlider.jsx";
import OfferDetails from "./Components/Pages/OfferDetails.jsx";

import ShyamBakery from "./Components/ShopsDetailPage/ShyamBakery.jsx";
import ShaymChips from "./Components/ShopsDetailPage/ShaymChips.jsx";
import AllShopsSlider from "./Components/ShopAllSlider/AllShopsSlider.jsx";
import ShyamSev from "./Components/ShopsDetailPage/ShyamSev.jsx";
import ShaymBhujiya from "./Components/ShopsDetailPage/ShaymBhujiya.jsx";

import KajuNamkeen from "./Components/ViewAll/KajuNamkeen.jsx";
import SingleItemAll from "./Components/ViewAll/SingleItems.jsx";
import SingleItems from "./Components/ShopsDetailPage/SingleItems.jsx";

import MaidaItems from "./Components/Food/MaidaItems.jsx";
import MixAll from "./Components/ViewAll/MixAll.jsx";
import ChuraAll from "./Components/ViewAll/Chura.jsx";
import ChipsAll from "./Components/ViewAll/ChipsAll.jsx";
import BhujiyaAll from "./Components/ViewAll/BhujiyaAll.jsx";
import SevAll from "./Components/ViewAll/SevAll.jsx";
import PastryAll from "./Components/ViewAll/PastryAll.jsx";
import CakeAll from "./Components/ViewAll/CakeAll.jsx";
import CookiesAll from "./Components/ViewAll/CookiesAll.jsx";
import ItemsAll from "./Components/ViewAll/Items.jsx";
import OffersAll from "./Components/ViewAll/OffersAll.jsx";

import WeekendSpecial from "./Components/ViewAll/WeekendSpecial.jsx";
import DiscountOffer from "./Components/DiscountOffer/DiscountOffer.jsx";
import DynamicSlider from "./Components/Slider/DynamicSlider.jsx";

import CategoryPage from "./Components/Category/CategoryPage.jsx";
import AllOffersProducts from "./Components/Food/AllOffersProducts.jsx";
import OrderHistory from "./Components/CheckoutPage/OrderHistory.jsx";
import ProfilePage from "./Components/Login/ProfilePage.jsx";
import ItemsSectionProducts from "./Components/Food/ItemsSectionProducts.jsx";

const BASE_URL = import.meta.env?.VITE_API_URL || "https://shyamfoodbackend.onrender.com/api";

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

const MainLayout = () => (
  <>
    <ScrollToTop />
    <ScrollToTopButton />
    <Navbar />
    <Outlet />
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

  const location = useLocation();

  // Categories fetch
  useEffect(() => {
    axios
      .get(`${BASE_URL}/category/categories`)
      .then((res) => {
        const categoryData = res.data.categories || res.data.data || res.data || [];
        const names = categoryData.map((cat) => cat.name || cat.title);
        setCategories(names);
      })
      .catch((err) => console.error("Categories fetch error:", err));
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
              <Button
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                price={price}
                setPrice={setPrice}
                cuisine={cuisine}
                setCuisine={setCuisine}
              />
              {/* <AllOffer /> */}

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

              <Items tag="trending" title="Hot & Trending Food Offers" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <Items tag="combo" title="Combo Deals" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <Items tag="weekend-special" title="Weekend Special" filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <Offers filter={filter} sortBy={sortBy} price={price} cuisine={cuisine} />
              <AppBanner />
            </>
          }
        />

        <Route path="/section/:tag" element={<ItemsSectionProducts />} />

        {/* E-Commerce Operations */}
        <Route path="/order" element={<OrderPage />} />
        <Route path="/cart" element={<CartPage />} />

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