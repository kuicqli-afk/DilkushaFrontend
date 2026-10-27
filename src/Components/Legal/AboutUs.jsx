import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaLeaf, FaShieldAlt, FaShippingFast, FaBirthdayCake } from "react-icons/fa";
import { BUSINESS as B } from "./LegalLayout";
import AnimatedText from "../Motion/AnimatedText";
import { RevealImage, StaggerChildren } from "../Motion/motionKit";
import { optimizeImage } from "../../utils/image";
import { CategorySkeleton } from "../Skeleton/Skeleton";
import "./LegalPages.css";

const CATEGORIES_URL = "http://localhost:5001/api/category/categories";

// Everything here restates what the site already says elsewhere (logo
// tagline, Pure Veg badge, Terms, footer promises); the category grid is
// loaded live, so it always matches the shop.
const PROMISES = [
  {
    icon: FaLeaf,
    title: "Pure veg",
    text: "Everything we make is vegetarian, from namkeen and gajak to cakes and cookies.",
  },
  {
    icon: FaShieldAlt,
    title: "Freshly made, hygienically",
    text: "Our products are freshly prepared in hygienic conditions, in line with FSSAI food safety standards.",
  },
  {
    icon: FaShippingFast,
    title: "Delivered across Lucknow",
    text: "We deliver in and around Lucknow, usually in about 45 minutes for nearby areas.",
  },
  {
    icon: FaBirthdayCake,
    title: "Cakes and bulk orders",
    text: "Custom cakes, gift hampers and bulk orders for celebrations, offices and festivals.",
  },
];

const AboutUs = () => {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(CATEGORIES_URL)
      .then((res) => {
        const list = res.data.categories || res.data.data || [];
        if (!cancelled) setCategories(list.filter((c) => !c.hidden && c.image));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="legal-page">
      <StaggerChildren className="legal-hero">
        <nav className="legal-breadcrumb">
          <Link to="/">Home</Link> / <span>About us</span>
        </nav>
        <h1>Swaad bhi, sehat bhi.</h1>
        <p className="legal-intro">
          {B.brand} makes namkeen, bhujiya, chips, gajak, cakes, pastries and cookies in Lucknow, and delivers
          them fresh to your door.
        </p>
      </StaggerChildren>

      <div className="contact-body about-body">
        <section className="about-section">
          <AnimatedText as="h2" text="What we promise" className="about-heading" />
          <StaggerChildren className="contact-ways about-promises">
            {PROMISES.map((promise) => {
              const Icon = promise.icon;
              return (
                <div className="contact-way" key={promise.title}>
                  <span className="contact-way-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{promise.title}</h3>
                  <p>{promise.text}</p>
                </div>
              );
            })}
          </StaggerChildren>
        </section>

        <section className="about-section">
          <AnimatedText as="h2" text="What we make" className="about-heading" />
          {categories === null ? (
            <CategorySkeleton count={6} />
          ) : categories.length > 0 ? (
            <StaggerChildren className="about-categories">
              {categories.map((c) => (
                <Link key={c._id} to={`/category/${encodeURIComponent(c.name)}`} className="about-category">
                  <span className="about-category-photo">
                    <RevealImage src={optimizeImage(c.image, 240)} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span>{c.name}</span>
                </Link>
              ))}
            </StaggerChildren>
          ) : (
            <p className="about-fallback">
              <Link to="/category/all">Browse all our categories</Link>
            </p>
          )}
        </section>

        <StaggerChildren className="contact-details">
          <section className="contact-panel">
            <h2>Order something today</h2>
            <p>Fresh namkeen, sweets and bakes, delivered across Lucknow.</p>
            <p>
              <Link to="/category/all">Shop all products</Link>
            </p>
          </section>
          <section className="contact-panel">
            <h2>Planning a celebration?</h2>
            <p>Talk to us about custom cakes, gift hampers and bulk orders.</p>
            <p>
              <Link to="/contact-us">Contact us</Link>
            </p>
          </section>
        </StaggerChildren>
      </div>
    </div>
  );
};

export default AboutUs;
