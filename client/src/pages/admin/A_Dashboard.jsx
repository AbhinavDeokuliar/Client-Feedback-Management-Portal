import React, { useState, useEffect } from 'react';
import { UserService, FeedbackService } from '../../services/Api';

const A_Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teamLoading, setTeamLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [feedbackError, setFeedbackError] = useState(null);

    // Fetch data when component mounts
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await UserService.getAllUsers(1, 20);
                // Filter to only show client users based on role
                const clientUsers = response.data.filter(user => user.role === 'client');
                setUsers(clientUsers);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to fetch users");
                setLoading(false);
            }
        };

        const fetchTeamMembers = async () => {
            try {
                setTeamLoading(true);
                const response = await UserService.getTeamMembers();
                setTeamMembers(response.data || []);
                setTeamLoading(false);
            } catch (err) {
                console.error("Error fetching team members:", err);
                setTeamError("Failed to fetch team members");
                setTeamLoading(false);
            }
        };

        const fetchAnalyticsData = async () => {
            try {
                setAnalyticsLoading(true);
                // Get analytics for the last 30 days
                const today = new Date();
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(today.getDate() - 30);

                const startDate = thirtyDaysAgo.toISOString().split('T')[0];
                const endDate = today.toISOString().split('T')[0];

                const response = await FeedbackService.getFeedbackStatistics(startDate, endDate);
                setAnalyticsData(response.data);
                setAnalyticsLoading(false);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setAnalyticsError("Failed to fetch analytics data");
                setAnalyticsLoading(false);
            }
        };

        const fetchRecentFeedback = async () => {
            try {
                setFeedbackLoading(true);
                // Fetch most recent 5 feedback items
                const response = await FeedbackService.getAllFeedback({
                    page: 1,
                    limit: 5,
                    sort: "-createdAt" // Sort by created date, newest first
                });
                setRecentFeedback(response.data || []);
                setFeedbackLoading(false);
            } catch (err) {
                console.error("Error fetching recent feedback:", err);
                setFeedbackError("Failed to fetch recent feedback");
                setFeedbackLoading(false);
            }
        };

        fetchUsers();
        fetchTeamMembers();
        fetchAnalyticsData();
        fetchRecentFeedback();
    }, []);

    // Calculate statistics for client users
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const newUsersThisMonth = users.filter(user => {
        const userCreatedDate = new Date(user.createdAt);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return userCreatedDate > oneMonthAgo;
    }).length;

    // Helper function to get background color based on feedback priority
    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-red-50 border-red-400';
            case 'medium': return 'bg-yellow-50 border-yellow-400';
            case 'critical': return 'bg-purple-50 border-purple-400';
            case 'low':
            default: return 'bg-blue-50 border-blue-400';
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-7xl mx-auto p-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Users</h2>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-700">Loading user data...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <>
                                <p className="text-gray-700">Total client users: {totalUsers}</p>
                                <p className="text-gray-700">Active client users: {activeUsers}</p>
                                <p className="text-gray-700">New client users this month: {newUsersThisMonth}</p>
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Client List:</h3>
                                    <div className="max-h-48 overflow-y-auto pr-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {users.map(user => (
                                                <div
                                                    key={user._id}
                                                    className="flex items-center bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors"
                                                    title={`${user.name} - ${user.companyName || 'No company'}`}
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mr-2">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-medium text-gray-700 truncate">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user.companyName || 'No company'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h2>
                    <div className="space-y-4">
                        {teamLoading ? (
                            <p className="text-gray-700">Loading team data...</p>
                        ) : teamError ? (
                            <p className="text-red-500">{teamError}</p>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-700">Total team members: {teamMembers.length}</p>
                                </div>

                                <div className="mt-3 max-h-48 overflow-y-auto pr-1">
                                    <div className="space-y-2">
                                        {teamMembers.map(member => (
                                            <div
                                                key={member._id}
                                                className="flex items-center bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400 hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-xs text-gray-500">{member.role || 'Team Member'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {teamMembers.length === 0 && (
                                            <p className="text-center text-gray-500 py-3">No team members found</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics</h2>
                    <div className="space-y-4">
                        {analyticsLoading ? (
                            <p className="text-gray-700">Loading analytics data...</p>
                        ) : analyticsError ? (
                            <p className="text-red-500">{analyticsError}</p>
                        ) : analyticsData ? (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                                        <p className="text-4xl font-bold text-blue-600">
                                            {analyticsData?.overview?.total || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Total Feedback</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4 text-center">
                                        <p className="text-4xl font-bold text-green-600">
                                            {analyticsData?.overview?.statusDistribution?.resolved || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Resolved</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-indigo-600">
                                            {analyticsData?.overview?.priorityDistribution?.high || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">High Priority</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-amber-600">
                                            {analyticsData?.overview?.averageResponseTime ?
                                                `${Math.round(analyticsData.overview.averageResponseTime / (1000 * 60 * 60))}h` : 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">Avg. Response Time</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-semibold text-teal-600">
                                            {analyticsData?.overview?.statusDistribution?.inProgress || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">In Progress</p>
                                    </div>
                                </div>

                                {/* Status distribution bar */}
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-1">Status Distribution</p>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        {analyticsData?.overview?.total > 0 && (
                                            <div className="flex h-full">
                                                <div
                                                    className="bg-blue-500"
                                                    style={{
                                                        width: `${(analyticsData.overview.statusDistribution.new / analyticsData.overview.total) * 100}%`
                                                    }}
                                                    title={`New: ${analyticsData.overview.statusDistribution.new}`}
                                                ></div>
                                                <div
                                                    className="bg-yellow-500"
                                                    style={{
                                                        width: `${(analyticsData.overview.statusDistribution.inProgress / analyticsData.overview.total) * 100}%`
                                                    }}
                                                    title={`In Progress: ${analyticsData.overview.statusDistribution.inProgress}`}
                                                ></div>
                                                <div
                                                    className="bg-green-500"
                                                    style={{
                                                        width: `${(analyticsData.overview.statusDistribution.resolved / analyticsData.overview.total) * 100}%`
                                                    }}
                                                    title={`Resolved: ${analyticsData.overview.statusDistribution.resolved}`}
                                                ></div>
                                                <div
                                                    className="bg-gray-500"
                                                    style={{
                                                        width: `${(analyticsData.overview.statusDistribution.closed / analyticsData.overview.total) * 100}%`
                                                    }}
                                                    title={`Closed: ${analyticsData.overview.statusDistribution.closed}`}
                                                ></div>
                                                <div
                                                    className="bg-red-500"
                                                    style={{
                                                        width: `${(analyticsData.overview.statusDistribution.reopened / analyticsData.overview.total) * 100}%`
                                                    }}
                                                    title={`Reopened: ${analyticsData.overview.statusDistribution.reopened}`}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>New: {analyticsData?.overview?.statusDistribution?.new || 0}</span>
                                        <span>Resolved: {analyticsData?.overview?.statusDistribution?.resolved || 0}</span>
                                    </div>
                                </div>

                                {/* Top Category */}
                                {analyticsData?.categoryDistribution?.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-medium text-gray-600">Top Category:</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {analyticsData.categoryDistribution[0].name}
                                            <span className="ml-1 text-xs text-gray-500">
                                                ({analyticsData.categoryDistribution[0].count} items)
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-700">No analytics data available</p>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Feedback</h2>
                    <div className="space-y-4">
                        {feedbackLoading ? (
                            <p className="text-gray-700">Loading recent feedback...</p>
                        ) : feedbackError ? (
                            <p className="text-red-500">{feedbackError}</p>
                        ) : recentFeedback.length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {recentFeedback.map(feedback => (
                                    <div
                                        key={feedback._id}
                                        className={`p-3 rounded-lg border-l-4 hover:shadow-md transition-shadow ${getPriorityColor(feedback.priority)}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-800 mb-1 truncate max-w-[80%]">
                                                {feedback.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${feedback.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                feedback.status === 'inProgress' ? 'bg-yellow-100 text-yellow-800' :
                                                    feedback.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                        feedback.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {feedback.status === 'inProgress' ? 'In Progress' :
                                                    feedback.status ? feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1) : 'New'}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {feedback.description}
                                        </p>

                                        <div className="flex flex-wrap justify-between items-center text-xs mt-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                                    {feedback.submittedBy?.profileImage && feedback.submittedBy.profileImage !== 'default-avatar.png' ? (
                                                        <img
                                                            src={`/uploads/avatars/${feedback.submittedBy.profileImage}`}
                                                            alt={feedback.submittedBy.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] text-blue-600 font-medium">
                                                            {feedback.submittedBy?.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600">
                                                    {feedback.submittedBy?.name || 'Anonymous'}
                                                </span>
                                            </div>

                                            <div className="flex items-center space-x-2 text-gray-500 mt-1 sm:mt-0">
                                                {feedback.category && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                                                        {feedback.category.name}
                                                    </span>
                                                )}
                                                <span>{formatDate(feedback.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-5">No feedback items found</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default A_Dashboard