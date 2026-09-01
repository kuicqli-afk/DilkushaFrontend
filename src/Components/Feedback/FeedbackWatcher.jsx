import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import FeedbackModal from "./FeedbackModal";

const BASE_URL = "https://shyamfoodbackend.onrender.com/api";
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

        try {
            const res = await axios.get(`${BASE_URL}/feedback/pending/user/${userId}`);
            const pending = res.data?.pending;
            if (!pending) return;

            const done = JSON.parse(localStorage.getItem("feedbackDone") || "[]");
            const snoozed = JSON.parse(sessionStorage.getItem("feedbackSnoozed") || "[]");

            if (done.includes(pending.orderId) || snoozed.includes(pending.orderId)) return;

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