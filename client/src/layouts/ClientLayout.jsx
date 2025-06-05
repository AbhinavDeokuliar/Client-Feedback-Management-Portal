import React from "react";
import { FaPlus, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";
import InternalRoutes from "../routes/Internal.Routes";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const ClientLayout = ({ user }) => {
    const location = useLocation();

    // Updated page transition variants for right-to-left page flipping effect
    const pageVariants = {
        initial: {
            opacity: 0,
            rotateY: -90, // Changed to negative to flip from right side
            transformOrigin: "right center", // Changed to right center
            scale: 0.85,
            filter: "blur(10px)",
            position: "absolute", // Added absolute positioning
            width: "100%", // Ensure full width
            zIndex: 0,
        },
        in: {
            opacity: 1,
            rotateY: 0,
            scale: 1,
            filter: "blur(0px)",
            position: "relative", // Back to relative when active
            zIndex: 1,
        },
        exit: {
            opacity: 0,
            rotateY: 90, // Changed to positive to exit to left side
            scale: 0.85,
            filter: "blur(10px)",
            position: "absolute", // Keep element in place during exit
            width: "100%", // Maintain full width
            zIndex: 0,
            transformOrigin: "left center", // Changed to left center
        },
    };

    // Updated page transition options
    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.65,
        when: "beforeChildren",
    };

    // CSS-in-JS styles
    const styles = {
        perspective: {
            perspective: "1500px",
        },
        perspective1000: {
            perspective: "1000px",
        },
        pageEdgeContainer: {
            position: "relative",
        },
        pageEdge: {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "3px",
            background: "linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1))",
            pointerEvents: "none",
        }
    };

    return (
        <div className="container mx-auto py-6 px-4 bg-blue-100 min-h-screen relative" style={styles.perspective}>
            {/* Simple decorative elements using Tailwind only */}
            <div className="absolute top-20 left-4 w-12 h-12 rounded-full"></div>
            <div className="absolute top-24 right-10 w-16 h-4"></div>
            <div className="absolute bottom-10 left-10 w-20 h-14 rounded-md"></div>

            {/* Vintage texture overlay using Tailwind's background opacity */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent pointer-events-none"></div>

            {/* Main content with AnimatePresence for route transitions */}
            <div className="relative overflow-hidden" style={{ ...styles.perspective1000, minHeight: "80vh" }}>
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={location.pathname}
                        className="relative z-10"
                        initial="initial"
                        animate="in"
                        exit="exit"
                        variants={pageVariants}
                        transition={pageTransition}
                        style={styles.pageEdgeContainer}
                    >
                        <div style={styles.pageEdge}></div>
                        <InternalRoutes userRole={user.role} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ClientLayout;