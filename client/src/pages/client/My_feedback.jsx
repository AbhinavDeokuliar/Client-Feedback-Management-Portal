import { useState, useEffect } from 'react';
import { FeedbackService, CategoryService } from '../../services/Api';
import { format, parseISO } from 'date-fns';
import './My_feedback.css';

const My_feedback = () => {
    // State variables
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 5,
        status: '',
        priority: '',
        category: '',
        sort: '-createdAt', // Default to newest first
    });
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const [showFilters, setShowFilters] = useState(false);

    // Status options with colors
    const statusOptions = [
        { value: 'new', label: 'New', color: '#3f51b5' },
        { value: 'in-progress', label: 'In Progress', color: '#ff9800' },
        { value: 'resolved', label: 'Resolved', color: '#4caf50' },
        { value: 'closed', label: 'Closed', color: '#9e9e9e' },
        { value: 'reopened', label: 'Reopened', color: '#f44336' },
    ];

    // Priority options with colors
    const priorityOptions = [
        { value: 'low', label: 'Low', color: '#8bc34a' },
        { value: 'medium', label: 'Medium', color: '#ffeb3b' },
        { value: 'high', label: 'High', color: '#ff9800' },
        { value: 'critical', label: 'Critical', color: '#f44336' },
    ];

    // Sort options
    const sortOptions = [
        { value: '-createdAt', label: 'Newest First' },
        { value: 'createdAt', label: 'Oldest First' },
        { value: '-updatedAt', label: 'Recently Updated' },
        { value: '-priority', label: 'Highest Priority' },
    ];

    // Fetch feedback data
    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const response = await FeedbackService.getAllFeedback({
                page: filters.page,
                limit: filters.limit,
                status: filters.status || undefined,
                priority: filters.priority || undefined,
                category: filters.category || undefined,
                sort: filters.sort || '-createdAt'
            });

            setFeedback(response.data);
            setPagination({
                page: response.pagination.page,
                totalPages: response.pagination.totalPages,
                total: response.total
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories for filter
    const fetchCategories = async () => {
        try {
            const response = await CategoryService.getAllCategories(true);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Handle page change
    const handlePageChange = (event, newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Handle filter change
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            page: 1, // Reset to first page when filters change
            [name]: value
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            page: 1,
            limit: 5,
            status: '',
            priority: '',
            category: '',
            sort: '-createdAt',
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        const found = statusOptions.find(option => option.value === status);
        return found ? found.color : '#000';
    };

    // Get priority color
    const getPriorityColor = (priority) => {
        const found = priorityOptions.find(option => option.value === priority);
        return found ? found.color : '#000';
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            return format(parseISO(dateString), 'MMM dd, yyyy • HH:mm');
        } catch (error) {
            return dateString;
        }
    };

    // View feedback details
    const handleViewDetails = (feedbackId) => {
        // Navigate to the feedback detail page
        window.location.href = `/feedback/${feedbackId}`;
    };

    // Initial data loading
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch feedback when filters change
    useEffect(() => {
        fetchFeedback();
    }, [filters]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Feedback</h1>
                    <p className="text-gray-600 mt-1">Track and manage all your submitted feedback</p>
                </div>
                <div className="flex mt-4 md:mt-0 space-x-3">
                    <button
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${showFilters
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        Filters
                    </button>
                    <button
                        className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                        onClick={resetFilters}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Reset
                    </button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                id="status-filter"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                {statusOptions.map(option => (
                                    <option value={option.value} key={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                id="priority-filter"
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Priorities</option>
                                {priorityOptions.map(option => (
                                    <option value={option.value} key={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="category-filter"
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option value={category.id} key={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                id="sort-filter"
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {sortOptions.map(option => (
                                    <option value={option.value} key={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback count and info */}
            <div className="mb-4 text-gray-600 text-sm">
                Showing {feedback.length} of {pagination.total} feedback items
            </div>

            {/* Notebook style feedback list */}
            <div className="notebook-container relative bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Notebook spiral binding */}
                <div className="notebook-spiral absolute left-0 top-0 bottom-0 w-5 bg-gray-100 flex flex-col justify-evenly items-center border-r border-gray-200">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="spiral-ring"></div>
                    ))}
                </div>

                {/* Notebook content with lines */}
                <div className="notebook-content pl-8 py-2">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="loader"></div>
                        </div>
                    ) : feedback.length === 0 ? (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold text-gray-700">No feedback found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters or submit new feedback</p>
                        </div>
                    ) : (
                        <div>
                            {feedback.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`notebook-line py-6 px-4 ${index !== feedback.length - 1 ? 'border-b border-dashed border-gray-300' : ''}`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                        {/* Title and category */}
                                        <div className="md:col-span-6">
                                            <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                                            <div className="flex items-center text-sm text-gray-600 mt-1 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <span>{item.category?.name || 'Uncategorized'}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                                        </div>

                                        {/* Status and date */}
                                        <div className="md:col-span-3 flex flex-col">
                                            <div
                                                className="inline-flex px-2 py-1 rounded-full text-xs font-medium w-fit"
                                                style={{ backgroundColor: getStatusColor(item.status), color: 'white' }}
                                            >
                                                {item.status?.charAt(0).toUpperCase() + item.status?.slice(1).replace('-', ' ')}
                                            </div>
                                            <div className="flex items-center mt-2 text-sm">
                                                <svg className="h-4 w-4 mr-1"
                                                    style={{ color: getPriorityColor(item.priority) }}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium">
                                                    {item.priority?.charAt(0).toUpperCase() + item.priority?.slice(1)} Priority
                                                </span>
                                            </div>
                                            <div className="flex items-center mt-3 text-xs text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{formatDate(item.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Comments and actions */}
                                        <div className="md:col-span-3 flex items-center justify-end space-x-3">
                                            <button
                                                className="px-3 py-1.5 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                                                onClick={() => window.location.href = `/feedback/${item.id}`}
                                            >
                                                View Details
                                            </button>
                                            {item.comments?.length > 0 && (
                                                <div className="comment-badge flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium">
                                                    {item.comments.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(null, 1)}
                        >
                            <span className="sr-only">First</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(null, pagination.page - 1)}
                        >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const pageNumber = i + 1;
                            // Only show a few pages around current page
                            if (
                                pageNumber === 1 ||
                                pageNumber === pagination.totalPages ||
                                Math.abs(pageNumber - pagination.page) <= 1
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === pageNumber
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        onClick={() => handlePageChange(null, pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            } else if (Math.abs(pageNumber - pagination.page) === 2) {
                                return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                            }
                            return null;
                        })}

                        <button
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => handlePageChange(null, pagination.page + 1)}
                        >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => handlePageChange(null, pagination.totalPages)}
                        >
                            <span className="sr-only">Last</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default My_feedback;