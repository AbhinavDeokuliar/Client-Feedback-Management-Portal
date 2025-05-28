import React from "react";
import { FaPlus, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";

const ClientLayout = ({ user }) => {
    return (
        <div className="container mx-auto py-6 px-4">
            <div className="bg-blue-50 rounded-lg p-6 shadow-md mb-6">
                <h1 className="text-2xl font-bold text-blue-800 mb-2">Welcome, {user?.name || 'Client'}!</h1>
                <p className="text-blue-600">Track your feedback and get solutions from our team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-1 text-gray-800">Submit New Feedback</h3>
                            <p className="text-sm text-gray-500">Share your thoughts or report issues</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <FaPlus className="text-blue-600" size={18} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-1 text-gray-800">My Feedback</h3>
                            <p className="text-sm text-gray-500">View all your submitted feedback</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                            <FaClipboardList className="text-green-600" size={18} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-teal-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-1 text-gray-800">Resolved Items</h3>
                            <p className="text-sm text-gray-500">Review completed feedback</p>
                        </div>
                        <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                            <FaCheckCircle className="text-teal-600" size={18} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-amber-500 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-1 text-gray-800">Response Time</h3>
                            <p className="text-sm text-gray-500">Average: 4.8 hours</p>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                            <FaClock className="text-amber-600" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">Recent Feedback</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map(item => (
                            <div key={item} className="border-b pb-4 last:border-0">
                                <div className="flex justify-between">
                                    <h3 className="font-medium">Login page not responding correctly</h3>
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">Submitted 3 days ago</p>
                                <p className="text-gray-600 mt-2">I'm experiencing issues with the login page. It doesn't respond when I click the login button.</p>
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 text-blue-600 font-medium hover:text-blue-800">
                        View All Feedback
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="font-bold text-lg mb-4 text-gray-800">Feedback Categories</h2>
                    <ul className="space-y-2">
                        <li className="flex justify-between">
                            <span className="text-gray-700">Bug Reports</span>
                            <span className="text-blue-600 font-medium">8</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-700">Feature Requests</span>
                            <span className="text-blue-600 font-medium">5</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-700">General Questions</span>
                            <span className="text-blue-600 font-medium">3</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-700">Performance Issues</span>
                            <span className="text-blue-600 font-medium">2</span>
                        </li>
                    </ul>
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="font-medium text-gray-800 mb-2">Need Help?</h3>
                        <p className="text-gray-600 text-sm mb-3">Our support team is here to assist you with any questions or concerns.</p>
                        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientLayout;