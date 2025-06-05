import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FeedbackList from '../../components/Client_Component/FeedbackList';
import { formatDistanceToNow } from 'date-fns';

// Simplified Animated Background Component using Tailwind CSS
const AnimatedBackground = () => {
    // Generate simpler array for particles
    const particleCount = 20;
    const particles = Array.from({ length: particleCount });

    return (
        <div className="fixed inset-0 top-16 overflow-hidden z-0 pointer-events-none">
            {particles.map((_, i) => {
                // Random properties calculated with simple JS
                const size = Math.random() * 40 + 15;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const delay = Math.random() * 2;
                const duration = Math.random() * 8 + 6;

                // Use only blue shades for consistent theme
                const colorClasses = [
                    "bg-blue-500/10", "bg-blue-400/10", "bg-blue-600/10",
                    "bg-indigo-500/10", "bg-sky-500/10", "bg-cyan-500/10"
                ];

                const colorIndex = Math.floor(Math.random() * colorClasses.length);

                return (
                    <motion.div
                        key={`particle-${i}`}
                        className={`absolute rounded-full shadow-lg backdrop-blur-sm ${colorClasses[colorIndex]}`}
                        style={{
                            width: size,
                            height: size,
                            left: `${x}%`,
                            top: `${y}%`,
                        }}
                        initial={{ opacity: 0.4, scale: 0.8 }}
                        animate={{
                            x: [0, Math.random() * 40 - 20],
                            y: [0, Math.random() * 40 - 20],
                            scale: [1, Math.random() * 0.3 + 0.85, 1],
                            opacity: [0.4, 0.6, 0.4]
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: delay
                        }}
                    />
                );
            })}
        </div>
    );
};

const Dashboard = () => {
    const [activeFeedback, setActiveFeedback] = useState(null);
    const [isModalClosing, setIsModalClosing] = useState(false);

    // Add useEffect to inject animation styles
    useEffect(() => {
        // Create a style element
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @keyframes zoom-in {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .motion-safe\\:animate-zoom-in {
                animation: zoom-in 0.3s ease-out forwards;
            }
        `;
        // Append to document head
        document.head.appendChild(styleEl);

        // Cleanup on unmount
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    // Handler for when a feedback item is clicked to view details
    const handleViewFeedback = (feedback) => {
        setActiveFeedback(feedback);
    };

    // Handler for closing the feedback modal with animation
    const handleCloseFeedback = () => {
        setIsModalClosing(true);
        setTimeout(() => {
            setActiveFeedback(null);
            setIsModalClosing(false);
        }, 300);
    };

    return (
        <div className="p-4 relative">
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Notebook-styled Feedbacks Section using only Tailwind */}
            <motion.section
                className={`w-full max-w-4xl mx-auto transition-all duration-300 z-10 relative
                         ${activeFeedback ? 'filter blur-sm scale-99 opacity-95' : 'filter blur-none scale-100 opacity-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Notebook container with binding - using only Tailwind */}
                <div className="relative bg-blue-50 rounded-lg shadow-lg overflow-hidden flex border border-blue-200">
                    {/* Left binding/spine of notebook */}
                    <div className="w-8 bg-gradient-to-r from-blue-700 to-blue-500 relative">
                        {/* Binding holes - using only Tailwind */}
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[18%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[36%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[54%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[72%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[90%] shadow-inner"></div>
                    </div>

                    {/* Notebook content area */}
                    <div className="flex-1 p-6 bg-blue-50 relative">
                        {/* Notebook ruled lines using Tailwind's background */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(251,_246,_219,_0)_0%,rgba(251,_246,_219,_0)_24px,rgba(226,_232,_240,_0.5)_24px,rgba(226,_232,_240,_0.5)_25px)] bg-[size:100%_25px] pointer-events-none"></div>

                        {/* Notebook title */}
                        <h2 className="font-serif italic text-3xl mb-6 text-blue-900 text-center font-bold relative">
                            Recent Feedback
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-blue-700/60"></div>
                        </h2>

                        {/* Feedback list */}
                        <div className="mt-4 relative z-10">
                            <FeedbackList
                                filters={{
                                    sort: '-createdAt',
                                    limit: 6
                                }}
                                onViewFeedback={handleViewFeedback}
                            />
                        </div>

                        {/* Page corner fold effect with pure Tailwind */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/70 shadow-md transform rotate-45 translate-x-6 -translate-y-6"></div>
                    </div>
                </div>
            </motion.section>

            {/* Active Feedback Modal - Update to match blue theme */}
            {activeFeedback && (
                <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleCloseFeedback}>
                    <div className="w-full max-w-4xl mx-auto" onClick={e => e.stopPropagation()}>
                        <div
                            className={`bg-blue-50 rounded-lg shadow-2xl p-4 transition-all duration-300 
                            ${isModalClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                            transform motion-safe:animate-zoom-in`}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                <h3 className="text-xl font-serif italic text-blue-900">{activeFeedback.title}</h3>
                                <button
                                    onClick={handleCloseFeedback}
                                    className="text-blue-700 hover:text-blue-900 focus:outline-none p-1 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Body with blue styling */}
                            <div className="px-6 py-4">
                                {/* Status and Priority Badges with blue styling */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`px-3 py-1 rounded-md text-sm font-serif italic
                                        ${activeFeedback.priority === 'high' ? 'bg-red-50 text-red-900 border border-red-200' :
                                            activeFeedback.priority === 'medium' ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' :
                                                'bg-green-50 text-green-900 border border-green-200'}`}>
                                        Priority: {activeFeedback.priority?.charAt(0).toUpperCase() + activeFeedback.priority?.slice(1)}
                                    </span>

                                    <span className={`px-3 py-1 rounded-md text-sm font-serif italic 
                                        ${activeFeedback.status === 'new' ? 'bg-blue-50 text-blue-900 border border-blue-200' :
                                            activeFeedback.status === 'inProgress' ? 'bg-purple-50 text-purple-900 border border-purple-200' :
                                                activeFeedback.status === 'resolved' ? 'bg-green-50 text-green-900 border border-green-200' :
                                                    'bg-gray-50 text-gray-900 border border-gray-200'}`}>
                                        Status: {activeFeedback.status?.charAt(0).toUpperCase() + activeFeedback.status?.slice(1)}
                                    </span>

                                    <span className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200 text-sm font-serif italic">
                                        {activeFeedback.category?.name || "Uncategorized"}
                                    </span>
                                </div>

                                {/* Description with blue styling */}
                                <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
                                    <h4 className="text-sm text-blue-800 mb-2 font-medium font-serif">Description</h4>
                                    <p className="text-gray-800 whitespace-pre-wrap">{activeFeedback.description}</p>
                                </div>

                                {/* Submission Details */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 shadow-sm border border-gray-200">
                                            <img
                                                src={activeFeedback.submittedBy?.profileImage || "/default-avatar.png"}
                                                alt={activeFeedback.submittedBy?.name || "User"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = "/default-avatar.png" }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{activeFeedback.submittedBy?.name || "Anonymous"}</p>
                                            <p className="text-sm text-gray-500">{activeFeedback.submittedBy?.email || ""}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Submitted</p>
                                        <p className="text-gray-700">
                                            {activeFeedback.createdAt ?
                                                formatDistanceToNow(new Date(activeFeedback.createdAt), { addSuffix: true }) :
                                                'Unknown date'}
                                        </p>
                                    </div>
                                </div>

                                {/* Additional Details - can be expanded based on your feedback model */}
                                {activeFeedback.attachments && activeFeedback.attachments.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm text-gray-600 mb-2 font-medium">Attachments</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeFeedback.attachments.map((attachment, index) => (
                                                <a
                                                    key={index}
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                                    </svg>
                                                    {attachment.name || `Attachment ${index + 1}`}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer with blue styling */}
                            <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 bg-blue-50 text-blue-800 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 font-serif"
                                    onClick={handleCloseFeedback}
                                >
                                    Close
                                </button>
                                {activeFeedback.status !== 'resolved' && (
                                    <button className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors shadow-sm font-serif">
                                        Add Comment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;