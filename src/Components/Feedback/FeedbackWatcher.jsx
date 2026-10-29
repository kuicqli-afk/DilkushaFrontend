import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FeedbackModal from "./FeedbackModal";
import { FEEDBACK_STORAGE_KEYS, isFeedbackSuppressed } from "./feedbackStore";
import { isSiteNoticePending } from "../SiteNotice/siteNoticeStore";

const BASE_URL = "https://dilkushabackend.onrender.com/api";
const POLL_INTERVAL = 10000;

function FeedbackWatcher() {
    const [activeOrder, setActiveOrder] = useState(null);
    const intervalRef = useRef(null);

    const checkPendingFeedback = async () => {
        let userId = null;
        try {
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                userId = parsed?._id || null;
            }
        } catch {
            userId = null;
        }

        if (!userId) return; // login nahi hai to check hi mat karo
        // never stack on top of the "under construction" notice
        if (isSiteNoticePending()) return;

        try {
            const res = await axios.get(`${BASE_URL}/feedback/pending/user/${userId}`);
            const pending = res.data?.pending;
            if (!pending) return;

            // answered or snoozed in this or any other tab: stay quiet
            if (isFeedbackSuppressed(pending.orderId)) return;

            setActiveOrder((prev) => prev || { orderId: pending.orderId });
        } catch (err) {
            console.error("Feedback watcher error:", err.message);
        }
    };

    useEffect(() => {
        checkPendingFeedback();
        intervalRef.current = setInterval(checkPendingFeedback, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, []);

    // answered or snoozed in another tab: close this tab's pop-up too
    useEffect(() => {
        const onStorage = (e) => {
            if (!FEEDBACK_STORAGE_KEYS.includes(e.key)) return;
            setActiveOrder((prev) => (prev && isFeedbackSuppressed(prev.orderId) ? null : prev));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    if (!activeOrder) return null;

    return (
        <FeedbackModal
            order={activeOrder}
            onClose={() => setActiveOrder(null)}
            onSubmitted={() => setActiveOrder(null)}
        />
    );
}

export default FeedbackWatcher;