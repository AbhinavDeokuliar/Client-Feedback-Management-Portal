import React from "react";
import { FaExclamationCircle, FaRegClock, FaCheckDouble, FaUserClock, FaChartBar } from "react-icons/fa";

const TeamLayout = ({ user }) => {
    // Determine specific team role for customized content
    const roleLabel = user?.role === 'manager' ? 'Manager' :
        user?.role === 'developer' ? 'Developer' :
            user?.role === 'qa' ? 'QA Specialist' : 'Support Team Member';

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="bg-green-50 rounded-lg p-6 shadow-md mb-6">
                <h1 className="text-2xl font-bold text-green-800 mb-2">{roleLabel} Dashboard</h1>
                <p className="text-green-600">Welcome back, {user?.name}! You have 12 feedback items assigned to you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                    <h3 className="font-bold mb-1 text-gray-800">High Priority</h3>
                    <p className="text-3xl font-bold text-red-600">4</p>
                    <p className="text-sm text-gray-500 mt-1">Requires immediate attention</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="font-bold mb-1 text-gray-800">In Progress</h3>
                    <p className="text-3xl font-bold text-yellow-600">8</p>
                    <p className="text-sm text-gray-500 mt-1">Currently being handled</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="font-bold mb-1 text-gray-800">Resolved</h3>
                    <p className="text-3xl font-bold text-green-600">23</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="font-bold mb-1 text-gray-800">Response Time</h3>
                    <p className="text-3xl font-bold text-blue-600">3.2h</p>
                    <p className="text-sm text-gray-500 mt-1">Average first response</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">Assigned Feedback</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">#483</td>
                                    <td className="px-6 py-4 text-sm font-medium">Login form not responsive</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center text-red-600 text-sm">
                                            <FaExclamationCircle className="mr-1" /> High
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">ABC Corp</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">#485</td>
                                    <td className="px-6 py-4 text-sm font-medium">Dashboard loading slowly</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center text-yellow-600 text-sm">
                                            <FaRegClock className="mr-1" /> Medium
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">XYZ Industries</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">#490</td>
                                    <td className="px-6 py-4 text-sm font-medium">Feature request: Export to PDF</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center text-green-600 text-sm">
                                            <FaCheckDouble className="mr-1" /> Low
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">123 Global</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button className="mt-4 text-green-600 font-medium hover:text-green-800">
                        View All Assigned Feedback
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="font-bold text-lg mb-4 text-gray-800">Performance Metrics</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Response Time</span>
                                    <span className="text-sm font-medium text-gray-700">85%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Resolution Rate</span>
                                    <span className="text-sm font-medium text-gray-700">92%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-700">Client Satisfaction</span>
                                    <span className="text-sm font-medium text-gray-700">78%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center">
                                <FaUserClock className="mr-2" /> Update Status
                            </button>
                            <button className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center">
                                <FaChartBar className="mr-2" /> View Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeamLayout;