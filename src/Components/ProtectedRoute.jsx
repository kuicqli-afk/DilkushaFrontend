import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { PageSkeleton } from "./Skeleton/Skeleton";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageSkeleton />;
    }

    if (!isAuthenticated) {
        // Redirect to login page while preserving target path
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}