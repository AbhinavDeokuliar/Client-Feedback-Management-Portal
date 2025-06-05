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

    return (
        <div className="container mx-auto py-6 px-4 bg-blue-100 min-h-screen relative perspective">
            {/* Simple decorative elements using Tailwind only */}
            <div className="absolute top-20 left-4 w-12 h-12 rounded-full"></div>
            <div className="absolute top-24 right-10 w-16 h-4"></div>
            <div className="absolute bottom-10 left-10 w-20 h-14 rounded-md"></div>

            {/* Vintage texture overlay using Tailwind's background opacity */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent pointer-events-none"></div>

            {/* Main content with AnimatePresence for route transitions */}
            <div className="relative perspective-1000 overflow-hidden" style={{ minHeight: "80vh" }}>
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={location.pathname}
                        className="relative z-10"
                        initial="initial"
                        animate="in"
                        exit="exit"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        <InternalRoutes userRole={user.role} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Add page flip shadow effect */}
            <style jsx global>{`
                .perspective {
                    perspective: 1500px;
                }

                .perspective-1000 {
                    perspective: 1000px;
                }

                /* Dynamic page flip shadow */
                @keyframes flip-shadow {
                    0% {
                        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
                    }
                    50% {
                        box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
                    }
                    100% {
                        box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
                    }
                }

                /* Page edge effect for the right side */
                .perspective-1000 > div > div {
                    position: relative;
                }

                .perspective-1000 > div > div::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1));
                    pointer-events: none;
                }

                /* Keep any old keyframes in case something else uses them */
                @keyframes shadow-change {
                    0% {
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
                    }
                    50% {
                        box-shadow: 0 20px 25px rgba(0, 0, 0, 0.25);
                    }
                    100% {
                        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
                    }
                }

                @keyframes page-edge {
                    from {
                        background-position: 0% 50%;
                    }
                    to {
                        background-position: 100% 50%;
                    }
                }

                @keyframes page-fade-in {
                    from {
                        opacity: 0;
                        transform: translateX(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes page-fade-out {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                }
            `}</style>
        </div>
    );
};

export default ClientLayout;