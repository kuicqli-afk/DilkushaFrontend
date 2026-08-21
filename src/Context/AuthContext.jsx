import React, { createContext, useContext, useState } from "react";

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

    const login = (userData, userToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
        setUserState(userData);
        setTokenState(userToken);
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