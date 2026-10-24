import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./LegalPages.css";
import { StaggerChildren } from "../Motion/motionKit";

// ====== EDIT THESE WITH YOUR REAL DETAILS ======
export const BUSINESS = {
    brand: "Shyam Namkeen & Bakers",
    legalName: "Shyam Namkeen & Bakers", // registered name (Proprietor/Pvt Ltd/LLP)
    website: "https://shyamnamkeenandbakers.online",
    email: "shyamnamkeenandbakers@gmail.com",
    phone: "+91 70805 12292",
    address: "Shyam Namkeen & Bakers, Lucknow, Uttar Pradesh, India – 226021",
    fssai: "Your 14-digit FSSAI License No.",
    gstin: "Your GSTIN",
    grievanceOfficer: "Officer Name",
    grievanceHours: "Monday to Saturday, 10:00 AM – 6:00 PM IST",
    jurisdiction: "Lucknow, Uttar Pradesh",
};

const LegalLayout = ({ title, intro, updated, sections }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.title = `${title} | ${BUSINESS.brand}`;
    }, [title]);

    const goTo = (e, id) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="legal-page">
            <StaggerChildren className="legal-hero">
                <nav className="legal-breadcrumb">
                    <Link to="/">Home</Link> / <span>{title}</span>
                </nav>
                <h1>{title}</h1>
                <p className="legal-updated">Last updated: {updated}</p>
                <p className="legal-intro">{intro}</p>
            </StaggerChildren>

            <div className="legal-body">
                <aside className="legal-toc">
                    <h3>Contents</h3>
                    <ol>
                        {sections.map((s) => (
                            <li key={s.id}>
                                <a href={`#${s.id}`} onClick={(e) => goTo(e, s.id)}>{s.title}</a>
                            </li>
                        ))}
                    </ol>
                </aside>

                <main className="legal-content">
                    {sections.map((s, i) => (
                        <StaggerChildren key={s.id} id={s.id} className="legal-section">
                            <h2>{i + 1}. {s.title}</h2>
                            {s.paras?.map((p, k) => <p key={k}>{p}</p>)}
                            {s.list && (
                                <ul>{s.list.map((li, k) => <li key={k}>{li}</li>)}</ul>
                            )}
                            {s.after?.map((p, k) => <p key={`a${k}`}>{p}</p>)}
                            {s.note && <div className="legal-note">{s.note}</div>}
                        </StaggerChildren>
                    ))}

                    <div className="legal-contact">
                        <h3>Need help?</h3>
                        <p>
                            Call <a href={`tel:${BUSINESS.phone.replace(/\s+/g, "")}`}>{BUSINESS.phone}</a>, email{" "}
                            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or see{" "}
                            <Link to="/contact-us">all the ways to reach us</Link>.
                        </p>
                        <p>{BUSINESS.address}</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LegalLayout;