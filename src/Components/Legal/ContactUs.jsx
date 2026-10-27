import { Link } from "react-router-dom";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { BUSINESS as B } from "./LegalLayout";
import { StaggerChildren } from "../Motion/motionKit";
import "./LegalPages.css";

const WHATSAPP_NUMBER = "917080512292"; // same number as the footer's WhatsApp button
const telHref = `tel:${B.phone.replace(/\s+/g, "")}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${B.brand}, Lucknow`)}`;

const ContactUs = () => (
    <div className="legal-page">
        <StaggerChildren className="legal-hero">
            <nav className="legal-breadcrumb">
                <Link to="/">Home</Link> / <span>Contact us</span>
            </nav>
            <h1>Contact us</h1>
            <p className="legal-intro">
                Questions about an order, a bulk or party order, or our menu? Call, message or email us and
                we'll help.
            </p>
        </StaggerChildren>

        <div className="contact-body">
            <StaggerChildren className="contact-ways">
                <a className="contact-way" href={telHref}>
                    <span className="contact-way-icon" aria-hidden="true">
                        <FaPhoneAlt />
                    </span>
                    <h2>Call us</h2>
                    <p>Fastest for an order that's on its way.</p>
                    <strong>{B.phone}</strong>
                </a>
                <a
                    className="contact-way"
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Dilkusha Biryani, I have a question.")}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="contact-way-icon" aria-hidden="true">
                        <FaWhatsapp />
                    </span>
                    <h2>WhatsApp</h2>
                    <p>Send photos, bulk orders or party order details.</p>
                    <strong>Message us</strong>
                </a>
                <a className="contact-way" href={`mailto:${B.email}`}>
                    <span className="contact-way-icon" aria-hidden="true">
                        <FaEnvelope />
                    </span>
                    <h2>Email</h2>
                    <p>For invoices, feedback and anything that isn't urgent.</p>
                    <strong>{B.email}</strong>
                </a>
            </StaggerChildren>

            <StaggerChildren className="contact-details">
                <section className="contact-panel">
                    <h2>Visit us</h2>
                    <p>{B.address}</p>
                    <a href={mapsHref} target="_blank" rel="noreferrer">
                        Open in Google Maps
                    </a>
                </section>
                <section className="contact-panel">
                    <h2>Problem with an order?</h2>
                    <p>
                        Contact us within 2 hours of delivery with your order ID and photos of the food and
                        packaging, and we'll refund or replace it.
                    </p>
                    <p>
                        <Link to="/orders">See your orders</Link>
                    </p>
                    <p>
                        <Link to="/shipping-and-delivery">Read our shipping and delivery policy</Link>
                    </p>
                </section>
            </StaggerChildren>
        </div>
    </div>
);

export default ContactUs;