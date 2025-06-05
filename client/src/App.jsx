import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Login from "./pages/login";
import Registration from "./pages/Registration";
import InternalRoutes from "./routes/Internal.Routes";
import { AdminLayout, ClientLayout, TeamLayout } from "./layouts";
import Not_Found from "./pages/Not_Found";

const App = () => {
  const [user, setUser] = useState(null);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    // Save user data to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AppContent user={user} onLogin={handleLogin} onLogout={handleLogout} />
  );
}

// Separate component to access useLocation hook
const AppContent = ({ user, onLogin, onLogout }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-blue-100">
      {/* Only show header when not on login/register page and user is logged in */}
      {!isAuthPage && user && (
        <header>
          <Navbar user={user} onLogout={onLogout} />
        </header>
      )}

      <main className={`flex-grow ${!isAuthPage && user ? 'pt-1' : ''}`}>
        <Routes>
          {/* Public routes for authentication */}
          <Route path="/login" element={
            !user ? <Login onLogin={onLogin} /> : <Navigate to="/" replace />
          } />
          <Route path="/register" element={
            !user ? <Registration /> : <Navigate to="/" replace />
          } />

          {/* Protected routes with proper layout selection */}
          {user && (
            <Route path="/*" element={
              user.role === 'admin' ? (
                <AdminLayout user={user}>
                  <InternalRoutes userRole={user.role} />
                </AdminLayout>
              ) : user.role === 'team' ? (
                <TeamLayout user={user}>
                  <InternalRoutes userRole={user.role} />
                </TeamLayout>
              ) : (
                <ClientLayout user={user}>
                  <InternalRoutes userRole={user.role} />
                </ClientLayout>
              )
            } />
          )}

          {/* Redirect to login if user is not authenticated */}
          {!user && <Route path="/*" element={<Navigate to="/login" replace />} />}

          {/* 404 route */}
          <Route path="*" element={<Not_Found />} />
        </Routes>
      </main>

      {/* Only show footer when not on login/register page and user is logged in */}
      {!isAuthPage && user && (
        <footer className="bg-amber-800 bg-opacity-20 text-amber-900 border-t border-amber-200">
          <Footer />
        </footer>
      )}


    </div>
  );
}

export default App;