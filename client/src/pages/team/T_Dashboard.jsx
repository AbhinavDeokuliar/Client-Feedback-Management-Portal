import { useState, useEffect, useRef } from 'react';
import { FeedbackService, UserService } from '../../services/Api';
import { useNavigate } from 'react-router-dom';

const T_Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignedFeedback, setAssignedFeedback] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('current'); // 'current' means assigned to current user
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    const STATUS_LABELS = {
        new: 'New',
        'in-progress': 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed',
        reopened: 'Reopened'
    };

    const PRIORITY_LABELS = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
    };

    useEffect(() => {
        // Check if user has admin privileges to show team filter
        const checkUserRole = async () => {
            try {
                const userData = await UserService.getCurrentUser();
                const userRole = userData.data?.role;
                setIsAdmin(['admin', 'manager'].includes(userRole));
            } catch (error) {
                console.error("Error checking user role:", error);
            }
        };

        checkUserRole();
    }, []);

    useEffect(() => {
        // Fetch team members for filter dropdown if user is admin
        const fetchTeamMembers = async () => {
            try {
                if (isAdmin) {
                    const response = await UserService.getTeamMembers();
                    setTeamMembers(response.data || []);
                }
            } catch (error) {
                console.error("Error fetching team members:", error);
            }
        };

        fetchTeamMembers();
    }, [isAdmin]);

    useEffect(() => {
        fetchAssignedFeedback();
    }, [selectedUser]);

    const fetchAssignedFeedback = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build the query parameters
            const queryParams = {
                limit: 15,
                sort: '-updatedAt'
            };

            // If selectedUser is 'current', filter by assignedToMe
            // Otherwise use the specific user ID
            if (selectedUser === 'current') {
                queryParams.assignedToMe = true;
            } else if (selectedUser) {
                queryParams.assignedTo = selectedUser;
            }

            // Fetch assigned feedback with filter
            const feedbackData = await FeedbackService.getAllFeedback(queryParams);
            setAssignedFeedback(feedbackData.data || []);
        } catch (error) {
            console.error("Error fetching assigned feedback:", error);
            setError("Failed to load assigned feedback. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Handle change in user filter
    const handleUserFilterChange = (event) => {
        setSelectedUser(event.target.value);
    };

    // Handle refresh button click
    const handleRefresh = () => {
        fetchAssignedFeedback();
    };

    const handleViewFeedback = (id) => {
        navigate(`/feedback/${id}`);
    };

    const renderPriorityChip = (priority) => {
        const priorityClasses = {
            low: 'bg-green-50 text-green-700',
            medium: 'bg-blue-50 text-blue-700',
            high: 'bg-yellow-50 text-yellow-700',
            critical: 'bg-red-50 text-red-700'
        };

        const priorityClass = priorityClasses[priority] || 'bg-gray-100 text-gray-700';

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityClass}`}>
                {PRIORITY_LABELS[priority] || priority}
            </span>
        );
    };

    const renderStatusChip = (status) => {
        const statusClasses = {
            new: 'bg-blue-50 text-blue-700',
            'in-progress': 'bg-yellow-50 text-yellow-700',
            resolved: 'bg-green-50 text-green-700',
            closed: 'bg-gray-100 text-gray-700',
            reopened: 'bg-red-50 text-red-700'
        };

        const statusClass = statusClasses[status] || 'bg-gray-100 text-gray-700';

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                {STATUS_LABELS[status] || status}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    // New state variables for modals
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [feedbackDetail, setFeedbackDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [comment, setComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState(null);
    const [commentSuccess, setCommentSuccess] = useState(false);

    const commentInputRef = useRef(null);

    // Fetch feedback details
    const fetchFeedbackDetails = async (id) => {
        try {
            setLoadingDetail(true);
            const response = await FeedbackService.getFeedbackById(id);
            setFeedbackDetail(response.data);
        } catch (error) {
            console.error("Error fetching feedback details:", error);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Handle opening the details modal
    const handleShowDetails = (feedback) => {
        setSelectedFeedback(feedback);
        fetchFeedbackDetails(feedback.id);
        setShowDetailsModal(true);
    };

    // Handle opening the comment modal
    const handleShowCommentModal = (feedback) => {
        setSelectedFeedback(feedback);
        setComment('');
        setCommentError(null);
        setCommentSuccess(false);
        setShowCommentModal(true);

        // Focus on comment input after modal opens
        setTimeout(() => {
            if (commentInputRef.current) {
                commentInputRef.current.focus();
            }
        }, 100);
    };

    // Handle submitting a new comment
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            setCommentError("Comment text is required");
            return;
        }

        try {
            setSubmittingComment(true);
            setCommentError(null);

            await FeedbackService.addComment(selectedFeedback.id, { text: comment });

            setCommentSuccess(true);
            setComment('');

            // Refresh the feedback list after adding comment
            setTimeout(() => {
                fetchAssignedFeedback();
                setShowCommentModal(false);
                setCommentSuccess(false);
            }, 1500);

        } catch (error) {
            console.error("Error adding comment:", error);
            setCommentError(error.message || "Failed to add comment. Please try again.");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Close modals
    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setFeedbackDetail(null);
    };

    const closeCommentModal = () => {
        setShowCommentModal(false);
        setComment('');
        setCommentError(null);
        setCommentSuccess(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="grid gap-4">
                <div className="col-span-12">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {selectedUser === 'current' ? 'My Assigned Feedback' : 'Team Member Feedback'}
                        </h1>

                        <div className="flex items-center gap-4">
                            {isAdmin && teamMembers.length > 0 && (
                                <div className="relative">
                                    <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Assigned To
                                    </label>
                                    <select
                                        id="user-filter"
                                        value={selectedUser}
                                        onChange={handleUserFilterChange}
                                        className="block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        <option value="current">Assigned to Me</option>
                                        {teamMembers.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={handleRefresh}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>

                            <div className="bg-blue-100 text-blue-800 rounded-md px-4 py-3 min-w-[180px]">
                                <p className="text-xs text-blue-600 mb-1">Total Assigned</p>
                                <p className="text-2xl font-bold text-center">{assignedFeedback.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Fixed table container with proper overflow handling */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {/* Wrapper with clear horizontal scroll indication */}
                        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="min-w-full table-fixed divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th scope="col" className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="w-[100px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th scope="col" className="w-[120px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="w-[180px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted By
                                        </th>
                                        <th scope="col" className="w-[150px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted Date
                                        </th>
                                        <th scope="col" className="w-[150px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Updated
                                        </th>
                                        <th scope="col" className="w-[120px] px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {assignedFeedback.length > 0 ? (
                                        assignedFeedback.map((feedback, index) => (
                                            <tr
                                                key={feedback.id}
                                                className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-6 py-4 overflow-hidden">
                                                    <div
                                                        className={`text-sm truncate ${feedback.status === 'new' ? 'font-semibold' : 'font-normal'} text-gray-900`}
                                                        title={feedback.title}
                                                    >
                                                        {feedback.title}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4">
                                                    {renderStatusChip(feedback.status)}
                                                </td>
                                                <td className="px-3 py-4">
                                                    {renderPriorityChip(feedback.priority)}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <span className="text-sm text-gray-500 truncate block" title={feedback.category?.name || 'Uncategorized'}>
                                                        {feedback.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="text-sm font-medium text-gray-900 truncate" title={feedback.submittedBy?.name || 'Unknown'}>
                                                        {feedback.submittedBy?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate" title={feedback.submittedBy?.email}>
                                                        {feedback.submittedBy?.email}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(feedback.createdAt)}
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    {formatDate(feedback.updatedAt)}
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleShowDetails(feedback)}
                                                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                            title="View Details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleShowCommentModal(feedback)}
                                                            className="text-green-600 hover:text-green-800 focus:outline-none"
                                                            title="Add Comment"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-10 text-center">
                                                <div className="text-center">
                                                    <p className="text-gray-700 font-medium">
                                                        {selectedUser === 'current'
                                                            ? 'No feedback items are currently assigned to you.'
                                                            : 'No feedback items are assigned to this team member.'}
                                                    </p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        When feedback items are assigned, they will appear here.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile text indicator for scrolling */}
                    <div className="md:hidden mt-2 text-xs text-gray-500 text-center">
                        Swipe left/right to see more data
                    </div>
                </div>
            </div>

            {/* Feedback Details Modal */}
            {showDetailsModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <h3 className="text-lg font-bold text-gray-800">Feedback Details</h3>
                            <button
                                onClick={closeDetailsModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                            {loadingDetail ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : feedbackDetail ? (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Title</h4>
                                        <p className="mt-1 text-lg font-semibold text-gray-800">{feedbackDetail.title}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                            <div className="mt-1">{renderStatusChip(feedbackDetail.status)}</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                                            <div className="mt-1">{renderPriorityChip(feedbackDetail.priority)}</div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Category</h4>
                                            <p className="mt-1 text-gray-800">{feedbackDetail.category?.name || 'Uncategorized'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-md text-gray-800 whitespace-pre-wrap">
                                            {feedbackDetail.description || 'No description provided'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Submitted By</h4>
                                            <p className="mt-1 text-gray-800">{feedbackDetail.submittedBy?.name || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">{feedbackDetail.submittedBy?.email}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Date Submitted</h4>
                                            <p className="mt-1 text-gray-800">{formatDate(feedbackDetail.createdAt)}</p>
                                        </div>
                                    </div>

                                    {feedbackDetail.attachments && feedbackDetail.attachments.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Attachments</h4>
                                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {feedbackDetail.attachments.map((attachment, index) => (
                                                    <div key={index} className="flex items-center p-2 border rounded-md">
                                                        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <span className="text-sm truncate" title={attachment.originalname}>
                                                            {attachment.originalname}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {feedbackDetail.comments && feedbackDetail.comments.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Comments</h4>
                                            <div className="space-y-4">
                                                {feedbackDetail.comments.map((comment, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-start">
                                                                <div className="mr-2 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                                                                    <span className="text-blue-700 font-medium text-sm">
                                                                        {comment.postedBy?.name?.charAt(0) || '?'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-800">
                                                                        {comment.postedBy?.name || 'Unknown User'}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatDate(comment.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-gray-700 whitespace-pre-wrap pl-10">
                                                            {comment.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-700">Could not load feedback details</p>
                                </div>
                            )}
                        </div>

                        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={closeDetailsModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Comment Modal */}
            {showCommentModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <h3 className="text-lg font-bold text-gray-800">Add Comment</h3>
                            <button
                                onClick={closeCommentModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitComment}>
                            <div className="p-6">
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-1">
                                        Adding comment to: <span className="font-medium text-gray-800">{selectedFeedback.title}</span>
                                    </p>
                                </div>

                                {commentError && (
                                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
                                        {commentError}
                                    </div>
                                )}

                                {commentSuccess && (
                                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded" role="alert">
                                        Comment added successfully!
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Comment
                                    </label>
                                    <textarea
                                        id="comment"
                                        ref={commentInputRef}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type your comment here..."
                                        disabled={submittingComment}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={closeCommentModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    disabled={submittingComment}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${submittingComment ? 'opacity-75 cursor-not-allowed' : ''}`}
                                    disabled={submittingComment}
                                >
                                    {submittingComment ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : 'Submit Comment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default T_Dashboard;