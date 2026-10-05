import React, { createContext, useContext, useState, useEffect } from "react";
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
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUserState(null);
        setTokenState(null);
    };

    // Auto verify user against DB on initial mount
    useEffect(() => {
        const verifyUser = async () => {
            const savedToken = localStorage.getItem("token");
            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });

                if (res.data?.success && res.data?.user) {
                    setUserState(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                } else if (res.data && !res.data.success && !res.data.user) {
                    logout();
                }
            } catch (err) {
                // If user was deleted from DB (401 Unauthorized or 404 Not Found)
                if (err.response?.status === 401 || err.response?.status === 404) {
                    console.warn("User account deleted or token invalid. Logging out...");
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        verifyUser();

        const handleAuthLogout = () => {
            setUserState(null);
            setTokenState(null);
        };
        window.addEventListener("auth-logout", handleAuthLogout);
        return () => window.removeEventListener("auth-logout", handleAuthLogout);
    }, []);

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