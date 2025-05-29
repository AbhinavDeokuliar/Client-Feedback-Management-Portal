import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, user, allowedRoles = [] }) => {
    const location = useLocation();

    // If there's no user, redirect to login with the intended destination
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // If roles are specified and user's role is not in the allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user's role
        if (user.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (['manager', 'developer', 'qa', 'support'].includes(user.role)) {
            return <Navigate to="/team/dashboard" replace />;
        } else {
            return <Navigate to="/client/dashboard" replace />;
        }
    }

    // If user is authenticated and authorized, render the protected component
    return children;
};

export default ProtectedRoute;