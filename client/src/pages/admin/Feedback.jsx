import React, { useState, useEffect } from 'react';
import { FeedbackService, CategoryService, UserService } from '../../services/Api';

const Feedback = () => {
    // State variables
    const [feedbackItems, setFeedbackItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
    const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: '',
        searchTerm: '',
        sortBy: '-createdAt', // Default sort by newest first
    });

    // New state variables for team member assignment
    const [teamMembers, setTeamMembers] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [searchTeamMember, setSearchTeamMember] = useState('');
    const [selectedTeamMember, setSelectedTeamMember] = useState(null);

    // Fetch feedback on initial load and when filters/pagination change
    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                setLoading(true);
                const queryParams = {
                    page: pagination.page,
                    limit: pagination.limit,
                    sort: filters.sortBy,
                    ...filters.status && { status: filters.status },
                    ...filters.priority && { priority: filters.priority },
                    ...filters.category && { category: filters.category },
                    ...filters.searchTerm && { search: filters.searchTerm },
                };

                const response = await FeedbackService.getAllFeedback(queryParams);
                setFeedbackItems(response.data || []);
                setPagination({
                    page: response.pagination.page,
                    totalPages: response.pagination.totalPages,
                    limit: response.pagination.limit
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load feedback data");
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await CategoryService.getAllCategories(true); // Get only active categories
                setCategories(response.data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchFeedback();
        fetchCategories();
    }, [filters, pagination.page, pagination.limit]);

    // Fetch team members immediately when component mounts
    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                console.log("Fetching team members...");
                const response = await UserService.getTeamMembers();

                // The API returns {success, count, data} structure
                if (response && response.success && Array.isArray(response.data)) {
                    console.log(`Successfully loaded ${response.count} team members`);
                    setTeamMembers(response.data);
                } else {
                    console.error("Unexpected team members response format:", response);
                    setTeamMembers([]);
                }
            } catch (err) {
                console.error("Error fetching team members:", err);
                showNotification("Failed to load team members", 'error');
                setTeamMembers([]);
            }
        };

        fetchTeamMembers();
    }, []);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        // Reset to first page when changing filters
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    // Handle status change with proper loading state
    const handleStatusChange = async (id, newStatus) => {
        try {
            setStatusUpdateLoading(id); // Set loading state for this specific item

            await FeedbackService.changeFeedbackStatus(id, newStatus);

            // Update the local state to reflect the change immediately
            const updatedFeedbackItems = feedbackItems.map(item =>
                item._id === id ? { ...item, status: newStatus } : item
            );
            setFeedbackItems(updatedFeedbackItems);

            // Show success notification
            showNotification(`Status updated to ${formatStatus(newStatus)}`, 'success');
        } catch (err) {
            console.error("Error updating status:", err);
            showNotification("Failed to update status", 'error');
        } finally {
            setStatusUpdateLoading(null); // Clear loading state
        }
    };

    // Open assignment modal
    const handleOpenAssignModal = (feedbackId) => {
        setSelectedFeedbackId(feedbackId);
        setIsAssignModalOpen(true);
        setSelectedTeamMember(null);
        setSearchTeamMember('');
    };

    // Close assignment modal
    const handleCloseAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedFeedbackId(null);
        setSelectedTeamMember(null);
        setSearchTeamMember('');
    };

    // Handle team member assignment
    const handleAssignFeedback = async () => {
        if (!selectedFeedbackId || !selectedTeamMember) return;

        setAssignmentLoading(true);
        try {
            await FeedbackService.assignFeedback(selectedFeedbackId, selectedTeamMember._id);

            // Update the local state to reflect the assignment
            const updatedFeedbackItems = feedbackItems.map(item =>
                item._id === selectedFeedbackId ? { ...item, assignedTo: selectedTeamMember } : item
            );
            setFeedbackItems(updatedFeedbackItems);

            showNotification(`Feedback assigned to ${selectedTeamMember.name}`, 'success');
            handleCloseAssignModal();
        } catch (err) {
            console.error("Error assigning feedback:", err);
            showNotification("Failed to assign feedback", 'error');
        } finally {
            setAssignmentLoading(false);
        }
    };

    // Filter team members based on search term
    const filteredTeamMembers = teamMembers.filter(member => {
        return member.name.toLowerCase().includes(searchTeamMember.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTeamMember.toLowerCase()) ||
            (member.role && member.role.toLowerCase().includes(searchTeamMember.toLowerCase()));
    });

    // Simple notification system
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Format date helper
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    // Background color helper based on priority
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-purple-100 text-purple-800';
            case 'low':
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    // Status badge helper
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'inprogress':
            case 'in progress':
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            case 'reopened':
                return 'bg-red-100 text-red-800';
            case 'new':
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Display status in a user-friendly format
    const formatStatus = (status) => {
        if (!status) return 'New';
        if (status.toLowerCase() === 'inprogress' || status.toLowerCase() === 'in-progress') {
            return 'In Progress';
        }
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Team Member Assignment Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Assign Feedback to Team Member</h3>
                                <button
                                    className="text-gray-400 hover:text-gray-600"
                                    onClick={handleCloseAssignModal}
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Remove debug info and simplify UI */}
                            {teamMembers.length === 0 && (
                                <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
                                    No team members available. Please refresh and try again.
                                </div>
                            )}

                            {/* Search box */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or role..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTeamMember}
                                    onChange={(e) => setSearchTeamMember(e.target.value)}
                                />
                            </div>

                            {/* Team members list */}
                            <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-md">
                                {filteredTeamMembers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {searchTeamMember ? "No matching team members found" :
                                            teamMembers.length > 0 ? "Type to search team members" : "Loading team members..."}
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {filteredTeamMembers.map(member => (
                                            <li
                                                key={member._id}
                                                className={`p-3 hover:bg-gray-50 cursor-pointer ${selectedTeamMember?._id === member._id ? 'bg-blue-50' : ''
                                                    }`}
                                                onClick={() => setSelectedTeamMember(member)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {member.profileImage && member.profileImage !== 'default-avatar.png' ? (
                                                            <img className="h-8 w-8 rounded-full" src={`/uploads/avatars/${member.profileImage}`} alt="" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-800 font-medium">{member.name.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                                    </div>
                                                    <div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {member.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={handleCloseAssignModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                                        ${(!selectedTeamMember || assignmentLoading) ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    onClick={handleAssignFeedback}
                                    disabled={!selectedTeamMember || assignmentLoading}
                                >
                                    {assignmentLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Assigning...
                                        </>
                                    ) : 'Assign'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>

                {/* Filters section - removing search filter */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Status filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="reopened">Reopened</option>
                            </select>
                        </div>

                        {/* Priority filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.priority}
                                onChange={e => handleFilterChange('priority', e.target.value)}
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Category filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.category}
                                onChange={e => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort by */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filters.sortBy}
                                onChange={e => handleFilterChange('sortBy', e.target.value)}
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="createdAt">Oldest First</option>
                                <option value="-priority">Highest Priority</option>
                                <option value="priority">Lowest Priority</option>
                                <option value="status">Status</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Feedback list */}
                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading feedback...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-10">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : feedbackItems.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg bg-gray-50">
                        <p className="text-gray-500">No feedback found matching your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* Move Actions column to be first */}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {feedbackItems.map(feedback => (
                                    <tr key={feedback._id} className="hover:bg-gray-50">
                                        {/* Actions column now first */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {/* Assign button */}
                                                <button
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                                    onClick={() => handleOpenAssignModal(feedback._id)}
                                                >
                                                    Assign
                                                </button>
                                                {/* Status dropdown - Fix positioning */}
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        type="button"
                                                        className="px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const dropdown = document.getElementById(`status-dropdown-${feedback._id}`);
                                                            const allDropdowns = document.querySelectorAll('[id^="status-dropdown-"]');
                                                            // Close all other dropdowns
                                                            allDropdowns.forEach(el => {
                                                                if (el !== dropdown) el.classList.add('hidden');
                                                            });
                                                            // Toggle this dropdown
                                                            dropdown.classList.toggle('hidden');
                                                        }}
                                                        disabled={statusUpdateLoading === feedback._id}
                                                    >
                                                        {statusUpdateLoading === feedback._id ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Status
                                                                <svg className="-mr-1 ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </>
                                                        )}
                                                    </button>
                                                    <div
                                                        id={`status-dropdown-${feedback._id}`}
                                                        className="hidden absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            document.getElementById(`status-dropdown-${feedback._id}`).classList.add('hidden');
                                                        }}
                                                    >
                                                        <div className="py-1" role="menu" aria-orientation="vertical">
                                                            <button
                                                                className={`block w-full text-left px-4 py-2 text-sm ${feedback.status === 'new' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                                                onClick={() => handleStatusChange(feedback._id, 'new')}
                                                            >
                                                                New
                                                            </button>
                                                            <button
                                                                className={`block w-full text-left px-4 py-2 text-sm ${feedback.status === 'in-progress' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                                                onClick={() => handleStatusChange(feedback._id, 'in-progress')}
                                                            >
                                                                In Progress
                                                            </button>
                                                            <button
                                                                className={`block w-full text-left px-4 py-2 text-sm ${feedback.status === 'resolved' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                                                onClick={() => handleStatusChange(feedback._id, 'resolved')}
                                                            >
                                                                Resolved
                                                            </button>
                                                            <button
                                                                className={`block w-full text-left px-4 py-2 text-sm ${feedback.status === 'closed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                                                onClick={() => handleStatusChange(feedback._id, 'closed')}
                                                            >
                                                                Closed
                                                            </button>
                                                            <button
                                                                className={`block w-full text-left px-4 py-2 text-sm ${feedback.status === 'reopened' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                                                onClick={() => handleStatusChange(feedback._id, 'reopened')}
                                                            >
                                                                Reopened
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{feedback.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{feedback.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(feedback.status)}`}>
                                                {formatStatus(feedback.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(feedback.priority)}`}>
                                                {feedback.priority?.charAt(0).toUpperCase() + feedback.priority?.slice(1) || 'Low'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{feedback.category?.name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    {feedback.submittedBy?.profileImage && feedback.submittedBy.profileImage !== 'default-avatar.png' ? (
                                                        <img className="h-8 w-8 rounded-full" src={`/uploads/avatars/${feedback.submittedBy.profileImage}`} alt="" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                            {feedback.submittedBy?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{feedback.submittedBy?.name || 'Anonymous'}</div>
                                                    <div className="text-xs text-gray-500">{feedback.submittedBy?.email || ''}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* New column for assigned team member */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {feedback.assignedTo ? (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8">
                                                        {feedback.assignedTo.profileImage && feedback.assignedTo.profileImage !== 'default-avatar.png' ? (
                                                            <img className="h-8 w-8 rounded-full" src={`/uploads/avatars/${feedback.assignedTo.profileImage}`} alt="" />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium">
                                                                {feedback.assignedTo.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{feedback.assignedTo.name}</div>
                                                        <div className="text-xs text-gray-500">{feedback.assignedTo.role || 'Team Member'}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(feedback.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && feedbackItems.length > 0 && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-3">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.page === pagination.totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={pagination.page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">First Page</span>
                                        <span className="h-5 w-5 flex justify-center items-center">«</span>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <span className="h-5 w-5 flex justify-center items-center">‹</span>
                                    </button>

                                    {/* Current page indicator */}
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                                        {pagination.page}
                                    </span>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <span className="h-5 w-5 flex justify-center items-center">›</span>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.totalPages)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="sr-only">Last Page</span>
                                        <span className="h-5 w-5 flex justify-center items-center">»</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedback;