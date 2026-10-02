import LegalLayout, { BUSINESS as B } from "./LegalLayout";

const sections = [
    {
        id: "acceptance",
        title: "Acceptance of Terms",
        paras: [
            `Welcome to ${B.brand} ("we", "us", "our"). These Terms and Conditions govern your access to and use of our website ${B.website}, our mobile applications, and all ordering, delivery and related services (together, the "Platform").`,
            "By browsing the Platform, creating an account or placing an order, you confirm that you have read, understood and agreed to these Terms and our Privacy Policy. If you do not agree, please do not use the Platform.",
        ],
    },
    {
        id: "about",
        title: "About Us & Regulatory Information",
        paras: [
            `${B.legalName} is a food business operator engaged in manufacturing and selling namkeen, snacks, sweets, bakery products and cakes from Lucknow, Uttar Pradesh.`,
        ],
        list: [
            `FSSAI License No.: ${B.fssai}`,
            `GSTIN: ${B.gstin}`,
            `Registered address: ${B.address}`,
        ],
    },
    {
        id: "eligibility",
        title: "Eligibility & Your Account",
        list: [
            "You must be at least 18 years old, or use the Platform under the supervision of a parent or guardian.",
            "You must provide accurate name, phone number, email and delivery address. Incorrect details may lead to failed delivery.",
            "You are responsible for keeping your login credentials and OTPs confidential and for all activity under your account.",
            "We may suspend or terminate accounts that provide false information, abuse offers or violate these Terms.",
        ],
    },
    {
        id: "products",
        title: "Products, Food Safety & Allergens",
        list: [
            "All products are freshly prepared in hygienic conditions in line with FSSAI food safety standards.",
            "Product images are for illustration only. Actual colour, shape, decoration and packaging may vary slightly.",
            "Weights are approximate; a variation of up to ±5% may occur in handmade items such as cakes, sweets and namkeen.",
            "Our kitchen handles wheat (gluten), milk, nuts, peanuts, sesame, soy and eggs. Products may contain traces of these allergens. Customers with allergies must check ingredient details or contact us before ordering.",
            "Shelf life and storage instructions are printed on the pack or product page. Cakes and fresh bakery items should be refrigerated and consumed within the stated time.",
            "Products are vegetarian unless clearly marked otherwise (e.g. egg-containing items).",
        ],
    },
    {
        id: "pricing",
        title: "Pricing & Taxes",
        list: [
            "All prices are in Indian Rupees (₹) and include applicable GST unless stated otherwise.",
            "Delivery charges, packaging charges and any other fees are shown before you confirm payment.",
            "Prices and availability may change without prior notice. The price applicable is the one shown at the time of order confirmation.",
            "In case of a pricing or listing error, we may cancel the order and refund any amount already paid.",
        ],
    },
    {
        id: "orders",
        title: "Placing & Accepting Orders",
        paras: [
            "Placing an order is an offer to buy. A contract is formed only when we confirm the order via SMS, email, WhatsApp or in-app notification.",
            "We may decline or cancel an order due to non-availability, delivery area limits, suspected fraud, incorrect pricing or events beyond our control. Any amount paid will be refunded in full.",
        ],
    },
    {
        id: "payments",
        title: "Payments",
        list: [
            "Payments are processed securely through Razorpay and support UPI, credit/debit cards, net banking and wallets. We do not store your card, CVV or UPI PIN details.",
            "Your order is confirmed only after successful payment authorisation (or selection of an available cash-on-delivery option, where offered).",
            "If money is debited but the order fails, the amount is usually auto-refunded by the payment gateway within 5–7 working days.",
            "Use of unauthorised payment instruments or fraudulent chargebacks may result in account termination and legal action.",
        ],
    },
    {
        id: "coupons",
        title: "Coupons, Offers & Promotions",
        list: [
            "Coupon codes are valid only for the stated period, minimum order value and eligible products.",
            "Only one coupon can be applied per order unless stated otherwise. Coupons cannot be exchanged for cash.",
            "We may withdraw or modify any offer at any time and may cancel orders where a coupon is misused or abused.",
        ],
    },
    {
        id: "delivery",
        title: "Delivery",
        list: [
            "We deliver within our serviceable areas in and around Lucknow. Availability is checked using your delivery address or pincode.",
            "Our standard delivery estimate is around 45 minutes for nearby locations. This is an estimate, not a guarantee, and may vary due to traffic, weather, order volume or festivals.",
            "Pre-ordered, bulk and custom orders are delivered at the scheduled slot agreed with you.",
            "Someone must be available at the address to receive the order. If we cannot reach you after reasonable attempts, the order may be cancelled without refund, as food is perishable.",
            "Risk of loss passes to you upon delivery. Please check the order at the time of receiving it.",
        ],
    },
    {
        id: "cancellation",
        title: "Cancellation Policy",
        list: [
            "Regular orders can be cancelled before the kitchen starts preparing them. Once preparation or dispatch begins, cancellation is not possible.",
            "Custom/designer cakes and bulk orders require at least 24 hours' notice for cancellation; otherwise, a cancellation charge of up to 100% may apply.",
            "If we cancel an order, you will receive a full refund to the original payment method.",
        ],
    },
    {
        id: "refunds",
        title: "Returns & Refunds",
        paras: [
            "Because our products are perishable food items, we do not accept returns after delivery. However, we will refund or replace an order if:",
        ],
        list: [
            "the wrong item was delivered;",
            "the item was damaged, spilled or tampered with in transit;",
            "the product was stale, spoiled or of poor quality; or",
            "items are missing from your order.",
        ],
        after: [
            `To raise a claim, contact us within 2 hours of delivery (24 hours for packaged, long-shelf-life namkeen) at ${B.phone} or ${B.email} with your order ID and clear photos/videos of the product and packaging.`,
            "Approved refunds are credited to the original payment method within 5–7 working days (UPI/wallet usually faster). For cash orders, refunds are made via bank transfer or UPI.",
        ],
    },
    {
        id: "conduct",
        title: "User Conduct",
        paras: ["You agree not to:"],
        list: [
            "use the Platform for any unlawful, fraudulent or abusive purpose;",
            "harass, threaten or abuse our staff or delivery partners;",
            "attempt to hack, scrape, overload or interfere with the Platform's security or operation;",
            "post false reviews or misleading information; or",
            "resell our products commercially without written permission.",
        ],
    },
    {
        id: "ip",
        title: "Intellectual Property",
        paras: [
            `All content on the Platform — including the ${B.brand} name, logo, product photos, recipes' presentation, text, graphics and software — is owned by or licensed to us and protected by Indian copyright and trademark law. You may not copy, reproduce, modify or distribute any content without our prior written consent.`,
        ],
    },
    {
        id: "liability",
        title: "Limitation of Liability",
        list: [
            "The Platform is provided on an \"as available\" basis. We do not guarantee uninterrupted or error-free service.",
            "To the fullest extent permitted by law, our total liability for any claim relating to an order is limited to the amount paid by you for that order.",
            "We are not liable for indirect or consequential losses, or for allergic reactions where allergen information was available but not followed by the customer.",
            "Nothing in these Terms limits your statutory rights as a consumer under the Consumer Protection Act, 2019.",
        ],
    },
    {
        id: "force",
        title: "Force Majeure",
        paras: [
            "We are not responsible for delay or failure caused by events beyond our reasonable control, including natural calamities, strikes, lockdowns, government orders, power or network failures, road closures or supply disruptions.",
        ],
    },
    {
        id: "thirdparty",
        title: "Third-Party Services & Links",
        paras: [
            "The Platform may link to or use third-party services such as Razorpay, Google Play, the App Store, WhatsApp and delivery partners. Their services are governed by their own terms, and we are not responsible for their content or practices.",
        ],
    },
    {
        id: "law",
        title: "Governing Law & Dispute Resolution",
        paras: [
            `These Terms are governed by the laws of India. Any dispute shall first be attempted to be resolved amicably through our grievance process. Failing that, the courts at ${B.jurisdiction} shall have exclusive jurisdiction, subject to your rights under the Consumer Protection Act, 2019.`,
        ],
    },
    {
        id: "grievance",
        title: "Grievance Officer",
        paras: [
            "In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the Grievance Officer is:",
        ],
        list: [
            `Name: ${B.grievanceOfficer}`,
            `Email: ${B.email}`,
            `Phone: ${B.phone}`,
            `Availability: ${B.grievanceHours}`,
        ],
        after: ["We acknowledge complaints within 48 hours and aim to resolve them within one month."],
    },
    {
        id: "changes",
        title: "Changes to These Terms",
        paras: [
            "We may update these Terms from time to time. The updated version will be posted here with a new \"Last updated\" date. Continued use of the Platform after changes means you accept the revised Terms.",
        ],
        note: "Questions about these Terms? Write to us and we'll be happy to help.",
    },
];

const TermsAndConditions = () => (
    <LegalLayout
        title="Terms and Conditions"
        updated="1 October 2026"
        intro="Please read these terms carefully before ordering. They explain your rights and responsibilities when buying namkeen, sweets, bakery items and cakes from us."
        sections={sections}
    />
);

export default TermsAndConditions;