import React, { useState } from "react";
import axios from "axios";
import { AiOutlineStar, AiFillStar } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import "./FeedbackModal.css";

const BASE_URL = "https://backend.shyamnamkeenandbakers.online/api";

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
        <div className="fb-backdrop">
            <div className="fb-dialog" role="dialog" aria-modal="true" aria-labelledby="fb-title">
                <button type="button" className="fb-close" onClick={handleRemindLater} aria-label="Close">
                    <IoClose size={22} />
                </button>

                <h3 id="fb-title" className="fb-title">
                    Your order is delivered! 🎉
                </h3>
                <p className="fb-sub">How was order #{order.orderId}?</p>

                <div className="fb-stars" role="radiogroup" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= (hoverRating || rating);
                        const Icon = filled ? AiFillStar : AiOutlineStar;
                        return (
                            <button
                                key={star}
                                type="button"
                                role="radio"
                                aria-checked={rating === star}
                                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                className={`fb-star${filled ? " is-on" : ""}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <Icon size={34} />
                            </button>
                        );
                    })}
                </div>

                <p className="fb-label">What did you like? (select all that apply)</p>
                <div className={`fb-tags${showOtherInput ? " has-other" : ""}`}>
                    {QUICK_TAGS.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                type="button"
                                aria-pressed={active}
                                className={`fb-tag${active ? " is-on" : ""}`}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>

                {showOtherInput && (
                    <textarea
                        autoFocus
                        className="fb-other"
                        placeholder="Tell us more..."
                        aria-label="Tell us more"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                    />
                )}

                {error && <p className="fb-error">{error}</p>}

                <div className="fb-actions">
                    <button type="button" className="fb-btn fb-btn-ghost" onClick={handleRemindLater}>
                        Remind me later
                    </button>
                    <button
                        type="button"
                        className="fb-btn fb-btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FeedbackModal;