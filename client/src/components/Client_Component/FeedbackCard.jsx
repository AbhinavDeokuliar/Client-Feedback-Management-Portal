import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const FeedbackCard = ({ feedback, onViewFeedback }) => {
    // Return null or placeholder if feedback is undefined
    if (!feedback) {
        return (
            <div className="border border-blue-200 rounded-md overflow-hidden bg-blue-50/80 p-4 text-center animate-pulse">
                <p className="text-blue-700 italic font-serif">No feedback available</p>
            </div>
        );
    }

    const {
        title,
        description,
        category,
        priority,
        status,
        submittedBy,
        createdAt,
        id
    } = feedback;

    // Priority badge color mapping with Tailwind only
    const priorityClasses = {
        high: "bg-red-50 text-red-900 border border-red-200",
        medium: "bg-yellow-50 text-yellow-900 border border-yellow-200",
        low: "bg-green-50 text-green-900 border border-green-200",
    };

    // Status badge color mapping with Tailwind only
    const statusClasses = {
        new: "bg-blue-50 text-blue-800 border border-blue-200",
        inProgress: "bg-purple-50 text-purple-800 border border-purple-200",
        resolved: "bg-green-50 text-green-800 border border-green-200",
        closed: "bg-gray-50 text-gray-800 border border-gray-200",
    };

    // Format the date
    const formattedDate = createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : 'Unknown date';

    return (
        <div className="border border-blue-200 rounded-md overflow-hidden bg-blue-50/80 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative group mb-6">
            {/* Vintage notebook elements using only Tailwind */}
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-sm z-10"></div>
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-700/30"></div>
            <div className="absolute top-0 w-full h-2 bg-blue-100/50 border-b border-blue-200/50"></div>

            {/* Horizontal ruled lines using Tailwind's background and spacing */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-100/10 to-transparent bg-[length:100%_25px]"></div>

            {/* Card Header with blue typography */}
            <div className="pl-4 pr-4 py-3 border-b border-blue-100 flex justify-between items-center relative">
                <h3 className="font-serif italic text-blue-900 text-lg truncate flex-1">{title || 'Untitled Feedback'}</h3>
                <span className={`text-xs px-2 py-1 rounded-md ${priorityClasses[priority] || 'bg-gray-50'} font-serif`}>
                    {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'No Priority'}
                </span>
            </div>

            {/* Card Body */}
            <div className="pl-4 pr-4 py-3 group relative">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {description || 'No description provided.'}
                </p>

                {/* Simple divider with Tailwind */}
                <div className="w-full h-px my-2 bg-blue-100"></div>

                <div className="flex items-center mb-3">
                    <div className="relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-blue-800/20 after:-rotate-1">
                        <p className="text-xs font-serif italic text-blue-900">{submittedBy?.name || "Anonymous"}</p>
                        <p className="text-xs text-blue-700">{submittedBy?.email || ""}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center text-xs gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-md border border-blue-200 font-serif">
                        {category?.name || "Uncategorized"}
                    </span>

                    <span className={`px-2 py-1 rounded-md ${statusClasses[status] || 'bg-gray-50'} font-serif`}>
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'No Status'}
                    </span>

                    <span className="text-blue-800 ml-auto font-serif italic">{formattedDate}</span>
                </div>
            </div>

            {/* Card Footer */}
            <div className="pl-4 pr-4 border-t border-blue-100 py-2 flex justify-end">
                <button
                    className="text-xs text-blue-800 hover:text-blue-900 hover:underline mr-4 transition-all duration-300 transform hover:scale-105 font-serif italic"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onViewFeedback) onViewFeedback(feedback);
                    }}
                >
                    View Details
                </button>
                <button className="text-xs text-blue-700 hover:text-blue-800 hover:underline transition-all duration-300 transform hover:scale-105 font-serif italic">
                    Comment
                </button>
            </div>

            {/* Random coffee stain using Tailwind only - conditionally added */}
            {Math.random() > 0.7 && (
                <div
                    className="absolute rounded-full blur-sm bg-blue-800/5 w-10 h-10"
                    style={{
                        top: `${Math.random() * 70}%`,
                        right: `${Math.random() * 20}%`
                    }}
                ></div>
            )}
        </div>
    );
};

export default FeedbackCard;
