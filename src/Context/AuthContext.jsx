import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const API_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
    "https://backend.shyamnamkeenandbakers.online/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setTokenState] = useState(() => localStorage.getItem("token") || null);
    const [loading] = useState(false);

    // Dynamic boolean check: True when both token and user exist
    const isAuthenticated = Boolean(token && user);

    const login = async (userData, userToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
        setUserState(userData);
        setTokenState(userToken);

        // Automatically follow store whenever customer logs in anywhere
        if (userData?._id) {
            try {
                await axios.post(`${API_URL}/follow`, { userId: userData._id });
                window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: true } }));
            } catch (err) {
                console.warn("Auto-follow on login error:", err);
            }
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUserState(null);
        setTokenState(null);
    };

    // Safe Profile/User updater
    const setUser = (updatedUserData) => {
        const mergedUser = typeof updatedUserData === "function"
            ? updatedUserData(user)
            : { ...user, ...updatedUserData };

        localStorage.setItem("user", JSON.stringify(mergedUser));
        setUserState(mergedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                token,
                isAuthenticated,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);