import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoutes.jsx';

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

// Team pages
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
                    userRole === 'team' || userRole === 'manager' || userRole === 'developer' ||
                        userRole === 'qa' || userRole === 'support' ?
                        <Navigate to="/team/dashboard" replace /> :
                        <Navigate to="/client/dashboard" replace />
            } />

            {/* Admin Routes - protected */}
            <Route path="/admin/dashboard" element={
                userRole === 'admin' ? <A_Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/analytics" element={
                userRole === 'admin' ? <Analytics /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/users" element={
                userRole === 'admin' ? <User /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/categories" element={
                userRole === 'admin' ? <Categories /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/feedback" element={
                userRole === 'admin' ? <Feedback /> : <Navigate to="/" replace />
            } />
            <Route path="/admin/exports" element={
                userRole === 'admin' ? <Exports /> : <Navigate to="/" replace />
            } />

            {/* Client Routes - protected */}
            <Route path="/client/dashboard" element={
                userRole === 'client' ? <Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/client/my-feedback" element={
                userRole === 'client' ? <My_Feedback /> : <Navigate to="/" replace />
            } />
            <Route path="/client/submit-feedback" element={
                userRole === 'client' ? <Submit_Feedback /> : <Navigate to="/" replace />
            } />

            {/* Team Routes - protected */}
            <Route path="/team/dashboard" element={
                ['team', 'manager', 'developer', 'qa', 'support'].includes(userRole) ?
                    <T_Dashboard /> : <Navigate to="/" replace />
            } />
            <Route path="/team/assigned-feedback" element={
                ['team', 'manager', 'developer', 'qa', 'support'].includes(userRole) ?
                    <Assigned_Feedback /> : <Navigate to="/" replace />
            } />

            {/* 404 page for unmatched routes */}
            <Route path="*" element={<Not_Found />} />
        </Routes>
    );
};

export default InternalRoutes;