import React, { useState } from "react";
import axios from "axios";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";

const QUICK_TAGS = [
    "Great taste",
    "Fast delivery",
    "Fresh packaging",
    "Good quality",
    "Value for money",
    "Other",
];

function FeedbackModal({ order, onClose, onSubmitted }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [otherText, setOtherText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const showOtherInput = selectedTags.includes("Other");

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
        if (tag === "Other" && selectedTags.includes("Other")) {
            setOtherText("");
        }
    };

    const handleSubmit = async () => {
        setError("");
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        if (showOtherInput && otherText.trim() === "") {
            setError("Please tell us a bit more, or unselect 'Other'.");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${BASE_URL}/feedback`, {
                orderId: order.orderId,
                rating,
                tags: selectedTags.filter((t) => t !== "Other"),
                comment: otherText.trim(),
            });

            const done = JSON.parse(localStorage.getItem("feedbackDone") || "[]");
            done.push(order.orderId);
            localStorage.setItem("feedbackDone", JSON.stringify(done));

            onSubmitted?.(order.orderId);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit feedback.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemindLater = () => {
        const snoozed = JSON.parse(sessionStorage.getItem("feedbackSnoozed") || "[]");
        snoozed.push(order.orderId);
        sessionStorage.setItem("feedbackSnoozed", JSON.stringify(snoozed));
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 2000, padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#fff", borderRadius: "18px", padding: "24px",
                    maxWidth: "400px", width: "100%", position: "relative",
                    maxHeight: "90vh", overflowY: "auto",
                }}
            >
                <button
                    onClick={handleRemindLater}
                    style={{
                        position: "absolute", top: "14px", right: "14px",
                        border: "none", background: "transparent", cursor: "pointer", color: "#999",
                    }}
                >
                    <IoClose size={22} />
                </button>

                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>
                    Your order is delivered! 🎉
                </h3>
                <p style={{ fontSize: "12.5px", color: "#888", marginBottom: "18px" }}>
                    How was order #{order.orderId}?
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "18px" }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= (hoverRating || rating);
                        const Icon = filled ? AiFillStar : AiOutlineStar;
                        return (
                            <Icon
                                key={star}
                                size={34}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                style={{ cursor: "pointer", color: filled ? "#f59e0b" : "#e5e7eb" }}
                            />
                        );
                    })}
                </div>

                <p style={{ fontSize: "12px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>
                    What did you like? (select all that apply)
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: showOtherInput ? "12px" : "18px" }}>
                    {QUICK_TAGS.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                style={{
                                    padding: "7px 14px", borderRadius: "20px",
                                    border: `1.5px solid ${active ? "#880559" : "#e2e2e2"}`,
                                    background: active ? "#880559" : "#fff",
                                    color: active ? "#fff" : "#555",
                                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>

                {showOtherInput && (
                    <textarea
                        autoFocus
                        placeholder="Tell us more..."
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        style={{
                            width: "100%", padding: "10px", borderRadius: "10px",
                            border: "1px solid #eee", fontSize: "12.5px", resize: "none",
                            minHeight: "70px", marginBottom: "18px", boxSizing: "border-box",
                        }}
                    />
                )}

                {error && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginBottom: "10px" }}>{error}</p>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={handleRemindLater}
                        style={{
                            flex: 1, padding: "10px", borderRadius: "20px",
                            border: "1px solid #ddd", background: "#fff", color: "#666",
                            fontSize: "12.5px", fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        Remind me later
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            flex: 1, padding: "10px", borderRadius: "20px",
                            border: "none", background: "#880559", color: "#fff",
                            fontSize: "12.5px", fontWeight: 700, cursor: "pointer",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FeedbackModal;