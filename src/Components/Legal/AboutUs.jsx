import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaDrumstickBite, FaFire, FaShieldAlt, FaShippingFast } from "react-icons/fa";
import { BUSINESS as B } from "./LegalLayout";
import AnimatedText from "../Motion/AnimatedText";
import { RevealImage, StaggerChildren } from "../Motion/motionKit";
import { optimizeImage } from "../../utils/image";
import { CategorySkeleton } from "../Skeleton/Skeleton";
import "./LegalPages.css";

const CATEGORIES_URL = "https://dilkushabackend.onrender.com/api/category/categories";

// The category grid is loaded live, so it always matches the menu in the shop.
const PROMISES = [
  {
    icon: FaDrumstickBite,
    title: "Proper non-veg",
    text: "Biryani, kebabs, curries and rolls made with chicken, mutton and more, the way Lucknow likes them.",
  },
  {
    icon: FaFire,
    title: "Cooked dum style",
    text: "Our biryani is slow cooked with fragrant rice and freshly ground masalas, so every plate arrives full of flavour.",
  },
  {
    icon: FaShieldAlt,
    title: "Freshly made, hygienically",
    text: "Our food is freshly prepared in hygienic conditions, in line with FSSAI food safety standards.",
  },
  {
    icon: FaShippingFast,
    title: "Delivered hot across Lucknow",
    text: "We deliver in and around Lucknow, usually in about 45 minutes for nearby areas.",
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
        <h1>Dum ka asli swaad.</h1>
        <p className="legal-intro">
          {B.brand} makes biryani, kebabs, curries, rolls and breads in Lucknow, and delivers them hot to your
          door.
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
              <Link to="/category/all">Browse our full menu</Link>
            </p>
          )}
        </section>

        <StaggerChildren className="contact-details">
          <section className="contact-panel">
            <h2>Order something today</h2>
            <p>Hot biryani, kebabs and curries, delivered across Lucknow.</p>
            <p>
              <Link to="/category/all">See the full menu</Link>
            </p>
          </section>
          <section className="contact-panel">
            <h2>Planning a party?</h2>
            <p>Talk to us about biryani by the handi, party platters and bulk orders.</p>
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