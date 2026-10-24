import { Link } from "react-router-dom";
import LegalLayout, { BUSINESS as B } from "./LegalLayout";

// Every point here restates the Delivery, Cancellation and Returns sections
// of the Terms and Conditions; keep the two pages in step when either changes.
const sections = [
    {
        id: "areas",
        title: "Where we deliver",
        paras: [
            "We deliver within our serviceable areas in and around Lucknow. Enter your delivery address or pincode at checkout and we'll tell you straight away whether we can deliver there.",
        ],
    },
    {
        id: "time",
        title: "How long delivery takes",
        list: [
            "Our standard delivery estimate is around 45 minutes for nearby locations.",
            "This is an estimate, not a guarantee: traffic, weather, order volume and festival days can add time.",
            "Pre-ordered, bulk and custom orders are delivered at the slot agreed with you.",
        ],
    },
    {
        id: "charges",
        title: "Delivery charges",
        paras: [
            "The delivery fee depends on the distance from our kitchen to your address. Your cart shows the distance and the fee, and checkout shows every charge before you pay.",
        ],
    },
    {
        id: "receiving",
        title: "Receiving your order",
        list: [
            "Please make sure someone is at the address to receive the order.",
            "If we can't reach you after reasonable attempts, the order may be cancelled without a refund, because food is perishable.",
            "Please check your order when you receive it.",
        ],
    },
    {
        id: "cancel",
        title: "Cancelling an order",
        list: [
            "Regular orders can be cancelled before the kitchen starts preparing them. Once preparation or dispatch begins, they can't be cancelled.",
            "Custom or designer cakes and bulk orders need at least 24 hours' notice to cancel; otherwise a cancellation charge of up to 100% may apply.",
            "If we cancel your order, you get a full refund to your original payment method.",
        ],
    },
    {
        id: "problems",
        title: "Wrong, damaged or missing items",
        paras: [
            "We don't accept returns of delivered food, but we'll refund or replace your order if the wrong item arrived, or it was damaged, spoiled or incomplete.",
            `Contact us within 2 hours of delivery (24 hours for packaged namkeen) at ${B.phone} or ${B.email}, with your order ID and clear photos or videos of the product and packaging.`,
            "Approved refunds reach your original payment method within 5–7 working days (UPI and wallets are usually faster).",
        ],
        note: (
            <>
                The full rules are in our <Link to="/terms-and-conditions">Terms and Conditions</Link>.
            </>
        ),
    },
];

const ShippingPolicy = () => (
    <LegalLayout
        title="Shipping and Delivery"
        updated="24 October 2026"
        intro="Fresh namkeen, sweets and bakes, delivered across Lucknow. Here's where we deliver, how long it takes, what it costs and what to do if something isn't right."
        sections={sections}
    />
);

export default ShippingPolicy;
