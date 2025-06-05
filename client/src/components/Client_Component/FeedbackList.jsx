import React, { useState, useEffect } from 'react';
import { FeedbackService } from '../../services/Api';
import FeedbackCard from './FeedbackCard';

const FeedbackList = ({ filters = {}, onViewFeedback }) => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1
    });

    useEffect(() => {
        fetchFeedback();
    }, [pagination.page, filters]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            // Use the getAllFeedback method from FeedbackService with pagination and filters
            const response = await FeedbackService.getAllFeedback({
                page: pagination.page,
                limit: filters.limit || pagination.limit,
                ...filters
            });

            setFeedbackList(response.data);
            setPagination({
                page: response.pagination.page,
                limit: response.pagination.limit,
                totalPages: response.pagination.totalPages
            });
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch feedback');
            console.error('Error fetching feedback:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    if (loading && feedbackList.length === 0) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-gray-500 animate-pulse">Loading feedback...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md text-red-700 shadow-sm border border-red-100 transform transition hover:shadow-md">
                <p className="font-medium mb-2">Error: {error}</p>
                <button
                    onClick={fetchFeedback}
                    className="text-sm px-3 py-1 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition-all duration-300"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (feedbackList.length === 0) {
        return (
            <div className="bg-gray-50 p-6 rounded-md text-center border border-dashed border-gray-300 hover:border-gray-400 transition-all duration-300">
                <p className="text-gray-600 mb-2">No feedback found</p>
                <p className="text-sm text-gray-500">Try changing your filters or create new feedback</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
                    onClick={() => window.location.href = '/feedback/new'}
                >
                    Create Feedback
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedbackList.map((feedback, index) => (
                    <div
                        key={feedback.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 75}ms` }}
                    >
                        <FeedbackCard
                            feedback={feedback}
                            onViewFeedback={onViewFeedback}
                        />
                    </div>
                ))}
            </div>

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <nav className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className={`px-3 py-1 rounded transition-all duration-200 ${pagination.page === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                }`}
                        >
                            Previous
                        </button>

                        <div className="flex items-center mx-2 bg-gray-50 px-3 py-1 rounded-md">
                            <span className="text-sm text-gray-700">
                                Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                            </span>
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className={`px-3 py-1 rounded transition-all duration-200 ${pagination.page === pagination.totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                }`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

// Add these CSS animations to your global CSS file
const GlobalStyles = () => {
    return (
        <style jsx global>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fade-in-up {
                from { 
                    opacity: 0;
                    transform: translateY(10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
            
            .animate-fade-in-up {
                animation: fade-in-up 0.5s ease-out forwards;
            }
        `}</style>
    );
};

export default FeedbackList;
