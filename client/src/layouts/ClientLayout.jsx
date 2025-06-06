import React from "react";
import { FaPlus, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";
import InternalRoutes from "../routes/Internal.Routes";
import { useLocation } from "react-router-dom";

const ClientLayout = ({ user }) => {
    const location = useLocation();

    // CSS-in-JS styles without perspective effects
    const styles = {
        pageEdgeContainer: {
            position: "relative",
        },
        pageEdge: {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "2px",
            background: "linear-gradient(to right, transparent, rgba(0, 0, 0, 0.05))",
            pointerEvents: "none",
        }
    };

    return (
        <div className="container mx-auto py-6 px-4 bg-blue-100 min-h-screen relative">
            {/* Simple decorative elements using Tailwind only */}
            <div className="absolute top-20 left-4 w-12 h-12 rounded-full"></div>
            <div className="absolute top-24 right-10 w-16 h-4"></div>
            <div className="absolute bottom-10 left-10 w-20 h-14 rounded-md"></div>

            {/* Vintage texture overlay using Tailwind's background opacity */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent pointer-events-none"></div>

            {/* Main content without AnimatePresence for instant page changes */}
            <div className="relative overflow-hidden" style={{ minHeight: "80vh" }}>
                <div className="relative z-10" style={styles.pageEdgeContainer}>
                    <div style={styles.pageEdge}></div>
                    <InternalRoutes userRole={user.role} />
                </div>
            </div>
        </div>
    );
};

export default ClientLayout;