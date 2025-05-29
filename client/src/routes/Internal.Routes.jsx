import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin pages
import A_Dashboard from '../pages/admin/A_Dashboard.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import User from '../pages/admin/Users.jsx';
import Categories from '../pages/admin/Categories.jsx';
import Feedback from '../pages/admin/Feedback.jsx';
import Exports from '../pages/admin/Exports.jsx';

// Client pages
import Dashboard from '../pages/client/Dashboard.jsx';
import My_Feedback from '../pages/client/My_Feedback.jsx';
import Submit_Feedback from '../pages/client/Submit_Feedback.jsx';

//Team pages
import T_Dashboard from '../pages/team/T_Dashboard.jsx';
import Assigned_Feedback from '../pages/team/Assigned_Feedback.jsx';

// Common pages
import Not_Found from '../pages/Not_Found.jsx';

const InternalRoutes = ({ userRole }) => {
    return (
        <Routes>
            {/* Default route redirects based on user role */}
            <Route path="/" element={
                userRole === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
                    userRole === 'team' ? <Navigate to="/team/dashboard" replace /> :
                        <Navigate to="/client/dashboard" replace />
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<A_Dashboard />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<User />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/feedback" element={<Feedback />} />
            <Route path="/admin/exports" element={<Exports />} />

            {/* Client Routes */}
            <Route path="/client/dashboard" element={<Dashboard />} />
            <Route path="/client/my-feedback" element={<My_Feedback />} />
            <Route path="/client/submit-feedback" element={<Submit_Feedback />} />

            {/* Team Routes */}
            <Route path="/team/dashboard" element={<T_Dashboard />} />
            <Route path="/team/assigned-feedback" element={<Assigned_Feedback />} />

            {/* 404 page for unmatched routes */}
            <Route path="*" element={<Not_Found />} />
        </Routes>
    );
};

export default InternalRoutes;
