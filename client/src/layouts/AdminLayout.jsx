import React from "react";

const AdminLayout = ({ user }) => {
    return (
        <div className="container mx-auto py-6 px-4">
            <div className="bg-purple-50 rounded-lg p-6 shadow-md mb-6">
                <h1 className="text-2xl font-bold text-purple-800 mb-2">Admin Dashboard</h1>
                <p className="text-purple-600">Welcome back, {user?.name || 'Admin'}! Manage your feedback portal effectively.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="font-bold mb-2 text-gray-800">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-700">248</p>
                    <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="font-bold mb-2 text-gray-800">Active Feedback</h3>
                    <p className="text-3xl font-bold text-blue-700">54</p>
                    <p className="text-sm text-gray-500 mt-1">Requires attention</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="font-bold mb-2 text-gray-800">Resolved Items</h3>
                    <p className="text-3xl font-bold text-green-700">128</p>
                    <p className="text-sm text-gray-500 mt-1">This month</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="font-bold mb-2 text-gray-800">Avg. Response Time</h3>
                    <p className="text-3xl font-bold text-yellow-700">4.2h</p>
                    <p className="text-sm text-gray-500 mt-1">-18% from last month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(item => (
                            <div key={item} className="border-b pb-2 last:border-0">
                                <p className="text-gray-800 font-medium">New feedback submitted by Client Company</p>
                                <p className="text-gray-500 text-sm">Category: Bug Report • Priority: High</p>
                                <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 text-purple-600 font-medium hover:text-purple-800">
                        View All Activity
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                            Add New User
                        </button>
                        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Manage Categories
                        </button>
                        <button className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            Export Reports
                        </button>
                        <button className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                            System Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;