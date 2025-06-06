import React, { useState, useEffect, useRef } from 'react';
import { FeedbackService } from '../../services/Api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const data = await FeedbackService.getFeedbackStatistics(dateRange.startDate, dateRange.endDate);
            setAnalytics(data);
            setError(null);
        } catch (err) {
            setError("Failed to load analytics data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatTime = (milliseconds) => {
        if (!milliseconds) return 'N/A';
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''}`;
        } else {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    if (!analytics) {
        return null;
    }

    // Data preparation for charts
    const statusChartData = {
        labels: Object.keys(analytics.data.overview.statusDistribution),
        datasets: [
            {
                data: Object.values(analytics.data.overview.statusDistribution),
                backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#6B7280', '#EF4444'],
                borderColor: ['#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    const priorityChartData = {
        labels: Object.keys(analytics.data.overview.priorityDistribution),
        datasets: [
            {
                data: Object.values(analytics.data.overview.priorityDistribution),
                backgroundColor: ['#9CA3AF', '#F59E0B', '#EF4444', '#7F1D1D'],
                borderColor: ['#ffffff'],
                borderWidth: 2,
            },
        ],
    };

    const categoryChartData = {
        labels: analytics.data.categoryDistribution.map(item => item.name),
        datasets: [
            {
                label: 'Feedback Count',
                data: analytics.data.categoryDistribution.map(item => item.count),
                backgroundColor: '#6366F1',
                borderColor: '#4F46E5',
                borderWidth: 1,
            },
        ],
    };

    const timeTrendChartData = {
        labels: analytics.data.timeTrend.map(item => item.date),
        datasets: [
            {
                label: 'Feedback Submitted',
                data: analytics.data.timeTrend.map(item => item.count),
                borderColor: '#2563EB',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Feedback Analytics</h1>
                <p className="text-gray-600">Insights and statistics about client feedback</p>
            </div>

            {/* Date Range Filter */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Date Range</h2>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="self-end">
                        <button
                            onClick={fetchAnalytics}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm uppercase">Total Feedback</h3>
                        <p className="text-3xl font-bold text-blue-600">{analytics.data.overview.total}</p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm uppercase">Open Issues</h3>
                        <p className="text-3xl font-bold text-amber-500">
                            {analytics.data.overview.statusDistribution.new +
                                analytics.data.overview.statusDistribution.inProgress +
                                analytics.data.overview.statusDistribution.reopened}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm uppercase">Avg. Response Time</h3>
                        <p className="text-3xl font-bold text-indigo-600">
                            {formatTime(analytics.data.overview.averageResponseTime)}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm uppercase">Avg. Resolution Time</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatTime(analytics.data.overview.averageResolutionTime)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts - First Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Status Distribution */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
                    <div className="h-64">
                        <Pie data={statusChartData} options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Priority Distribution</h2>
                    <div className="h-64">
                        <Pie data={priorityChartData} options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* Charts - Second Row */}
            <div className="grid grid-cols-1 gap-8 mb-8">
                {/* Feedback Trend Over Time */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Feedback Trend Over Time</h2>
                    <div className="h-80">
                        <Line
                            data={timeTrendChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Charts - Third Row */}
            <div className="grid grid-cols-1 gap-8">
                {/* Category Distribution */}
                <div className="bg-white p-5 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Feedback by Category</h2>
                    <div className="h-80">
                        <Bar
                            data={categoryChartData}
                            options={{
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Response Performance Table */}
            {analytics.data.responsePerformance && analytics.data.responsePerformance.length > 0 && (
                <div className="mt-8 bg-white p-5 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Response Performance by Priority</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg. Response Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Min Response Time
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Max Response Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.data.responsePerformance.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${item.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                                                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        item.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatTime(item.avgResponseTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatTime(item.minResponseTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatTime(item.maxResponseTime)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Analytics;