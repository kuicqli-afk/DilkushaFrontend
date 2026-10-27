import LegalLayout, { BUSINESS as B } from "./LegalLayout";

const sections = [
    {
        id: "intro",
        title: "Introduction",
        paras: [
            `${B.brand} ("we", "us", "our") respects your privacy. This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and the choices you have. It applies to our website ${B.website}, mobile apps, WhatsApp ordering and all related services.`,
            "This policy is prepared in line with the Information Technology Act, 2000, the SPDI Rules, 2011 and the Digital Personal Data Protection Act, 2023.",
        ],
    },
    {
        id: "collect",
        title: "Information We Collect",
        list: [
            "Identity & contact: name, phone number, email address.",
            "Delivery details: saved addresses, landmarks, pincode and, with your permission, device location to help find your address.",
            "Order information: items ordered, order history, preferences (such as spice level or portion size), special instructions, and details of party or bulk orders.",
            "Payment information: payment status, transaction ID and method. Card, UPI PIN and bank credentials are handled directly by Razorpay and are never stored by us.",
            "Communication data: queries sent through our forms, WhatsApp, email or calls, and feedback/reviews.",
            "Technical data: IP address, device type, browser, operating system, app version, pages viewed and cookies.",
        ],
    },
    {
        id: "how",
        title: "How We Collect It",
        list: [
            "Directly from you when you register, place an order, apply a coupon, or contact us.",
            "Automatically through cookies, logs and analytics when you use the Platform.",
            "From payment and delivery partners, to confirm payments and complete deliveries.",
        ],
    },
    {
        id: "use",
        title: "Why We Use Your Information",
        list: [
            "To create your account, process orders, and deliver them to you.",
            "To confirm payments, handle refunds and prevent fraud.",
            "To send order updates by SMS, email, WhatsApp or app notifications.",
            "To provide customer support and resolve complaints.",
            "To personalise menus, suggest dishes and apply relevant offers.",
            "To send promotional messages and festival offers, only where you have consented (you can opt out anytime).",
            "To improve our food, menu, website performance and security.",
            "To comply with legal, tax and food-safety obligations.",
        ],
    },
    {
        id: "legal-basis",
        title: "Consent & Legal Basis",
        paras: [
            "We process your personal data based on your consent, to fulfil your order (a legitimate use), and to comply with law. By using the Platform and sharing your information, you consent to its use as described in this policy. You may withdraw consent at any time by contacting us, though this may affect our ability to serve you.",
        ],
    },
    {
        id: "sharing",
        title: "Who We Share Data With",
        paras: ["We do not sell your personal data. We share it only as needed with:"],
        list: [
            "Payment gateway: Razorpay, to process payments and refunds securely.",
            "Delivery partners: your name, phone number and address, only to deliver your order.",
            "Technology providers: hosting, SMS/WhatsApp, email and analytics services working under confidentiality obligations.",
            "Authorities: when required by law, court order or to protect our rights, safety or prevent fraud.",
            "Business transfer: if our business is merged or acquired, your data may be transferred with the same protections.",
        ],
    },
    {
        id: "cookies",
        title: "Cookies & Tracking",
        paras: [
            "We use cookies and similar technologies to keep you logged in, remember your cart, understand how the Platform is used and improve performance. You can disable cookies in your browser settings, but some features such as cart and checkout may not work properly.",
        ],
    },
    {
        id: "retention",
        title: "Data Retention",
        paras: [
            "We keep personal data only as long as necessary for the purposes above, or as required by law (for example, tax and accounting records are retained for up to 8 years). When no longer needed, data is deleted or anonymised.",
        ],
    },
    {
        id: "security",
        title: "How We Protect Your Data",
        list: [
            "HTTPS/SSL encryption for data in transit.",
            "Access controls so that only authorised staff can view personal data.",
            "Payments handled by PCI-DSS compliant Razorpay.",
            "Regular reviews of our systems and prompt action on vulnerabilities.",
        ],
        after: [
            "No internet transmission is 100% secure. Please keep your password and OTP private and tell us immediately if you suspect unauthorised use of your account.",
        ],
    },
    {
        id: "rights",
        title: "Your Rights",
        paras: ["Subject to applicable law, you have the right to:"],
        list: [
            "access the personal data we hold about you;",
            "correct or update inaccurate or incomplete data;",
            "request deletion of your data and account;",
            "withdraw consent or opt out of marketing messages;",
            "nominate another person to exercise your rights in case of death or incapacity; and",
            "raise a grievance and approach the Data Protection Board of India if unresolved.",
        ],
        after: [
            `To exercise these rights, email ${B.email} or call ${B.phone} from your registered number. We may verify your identity first and will respond within a reasonable period, generally within 30 days.`,
        ],
    },
    {
        id: "marketing",
        title: "Marketing Communications",
        paras: [
            "We may send you offers by SMS, WhatsApp or email only with your consent. You can unsubscribe by replying STOP, using the unsubscribe link, or contacting us. Essential order and service messages will still be sent.",
        ],
    },
    {
        id: "children",
        title: "Children's Privacy",
        paras: [
            "Our Platform is not intended for children under 18 to use without a parent or guardian. We do not knowingly collect personal data from minors without verifiable parental consent. If you believe a child has shared data with us, please contact us and we will delete it.",
        ],
    },
    {
        id: "thirdparty",
        title: "Third-Party Links",
        paras: [
            "Our Platform may contain links to third-party sites or apps (such as social media, Google Play or the App Store). We are not responsible for their privacy practices; please read their policies.",
        ],
    },
    {
        id: "storage",
        title: "Data Storage & Transfers",
        paras: [
            "Your data is primarily stored on secure servers. If any service provider processes data outside India, we ensure it is done in line with applicable law and with appropriate safeguards.",
        ],
    },
    {
        id: "grievance",
        title: "Grievance Officer",
        paras: ["For privacy questions, complaints or data requests, contact:"],
        list: [
            `Name: ${B.grievanceOfficer}`,
            `Email: ${B.email}`,
            `Phone: ${B.phone}`,
            `Address: ${B.address}`,
            `Availability: ${B.grievanceHours}`,
        ],
        after: ["We acknowledge complaints within 48 hours and aim to resolve them within 30 days."],
    },
    {
        id: "changes",
        title: "Changes to This Policy",
        paras: [
            "We may update this policy to reflect changes in law or our services. The latest version will always be on this page with the updated date. For significant changes, we will notify you through the Platform, email or WhatsApp.",
        ],
        note: "By continuing to use our Platform after updates, you agree to the revised Privacy Policy.",
    },
];

const PrivacyPolicy = () => (
    <LegalLayout
        title="Privacy Policy"
        updated="27 October 2026"
        intro="Your trust matters to us. This policy explains in simple terms what information we collect when you order from us, how we use it, and how we keep it safe."
        sections={sections}
    />
);

export default PrivacyPolicy;