import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL =
    import.meta.env?.VITE_API_URL ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
    "http://localhost:5001/api";

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
        window.dispatchEvent(new CustomEvent("follow-status-changed", { detail: { following: false } }));
    };

    // Auto verify user against DB on initial mount
    useEffect(() => {
        const verifyUser = async () => {
            const savedToken = localStorage.getItem("token");
            if (!savedToken) {
                setUserState(null);
                setTokenState(null);
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });

                const fetchedUser = res.data?.user || res.data?.data || (res.data?._id ? res.data : null);

                if (fetchedUser && (fetchedUser._id || fetchedUser.phone)) {
                    setUserState(fetchedUser);
                    localStorage.setItem("user", JSON.stringify(fetchedUser));
                } else {
                    console.warn("User data not found in response. Logging out...");
                    logout();
                }
            } catch (err) {
                // If ANY error occurs (user deleted in DB, 500, 401, 404, CORS, invalid token)
                console.warn("User verification failed from server. Logging out stale user...");
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyUser();

        const handleAuthLogout = () => {
            logout();
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