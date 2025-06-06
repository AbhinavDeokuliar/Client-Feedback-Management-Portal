import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Exports = () => {
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [analyticsExporting, setAnalyticsExporting] = useState(false);

    // Form states
    const [feedbackForm, setFeedbackForm] = useState({
        format: 'xlsx',
        startDate: '',
        endDate: '',
        status: '',
        priority: '',
        categories: [],
    });

    const [analyticsForm, setAnalyticsForm] = useState({
        format: 'xlsx',
        startDate: '',
        endDate: '',
    });

    const [availableCategories, setAvailableCategories] = useState([]);

    // Fetch categories for filtering
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/categories');

            // Add proper error handling
            if (response.data && response.data.data) {
                setAvailableCategories(response.data.data || []);
            } else {
                setAvailableCategories([]);
                console.warn('Categories response format is unexpected:', response.data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setAvailableCategories([]);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle feedback export form changes
    const handleFeedbackFormChange = (e) => {
        const { name, value } = e.target;
        setFeedbackForm({ ...feedbackForm, [name]: value });
    };

    // Handle analytics export form changes
    const handleAnalyticsFormChange = (e) => {
        const { name, value } = e.target;
        setAnalyticsForm({ ...analyticsForm, [name]: value });
    };

    // Handle category selection (multi-select)
    const handleCategoryChange = (categoryId) => {
        const updatedCategories = [...feedbackForm.categories];
        if (updatedCategories.includes(categoryId)) {
            const index = updatedCategories.indexOf(categoryId);
            updatedCategories.splice(index, 1);
        } else {
            updatedCategories.push(categoryId);
        }
        setFeedbackForm({ ...feedbackForm, categories: updatedCategories });
    };

    // Export feedback data
    const handleExportFeedback = async (e) => {
        e.preventDefault();
        try {
            setExporting(true);
            const response = await axios.post('/api/exports/feedback', {
                format: feedbackForm.format,
                startDate: feedbackForm.startDate || undefined,
                endDate: feedbackForm.endDate || undefined,
                status: feedbackForm.status || undefined,
                priority: feedbackForm.priority || undefined,
                category: feedbackForm.categories.length ? feedbackForm.categories : undefined
            });

            toast.success('Export completed successfully');
            // Open the download link in a new tab if available
            if (response.data && response.data.data && response.data.data.downloadUrl) {
                window.open(`${response.data.data.downloadUrl}`, '_blank');
            }
            setExporting(false);
        } catch (error) {
            console.error('Error exporting feedback:', error);
            toast.error('Failed to export feedback data');
            setExporting(false);
        }
    };

    // Export analytics data
    const handleExportAnalytics = async (e) => {
        e.preventDefault();
        try {
            setAnalyticsExporting(true);
            const response = await axios.post('/api/exports/analytics', {
                format: analyticsForm.format,
                startDate: analyticsForm.startDate || undefined,
                endDate: analyticsForm.endDate || undefined
            });

            toast.success('Analytics export completed successfully');
            // Open the download link in a new tab if available
            if (response.data && response.data.data && response.data.data.downloadUrl) {
                window.open(`${response.data.data.downloadUrl}`, '_blank');
            }
            setAnalyticsExporting(false);
        } catch (error) {
            console.error('Error exporting analytics:', error);
            toast.error('Failed to export analytics data');
            setAnalyticsExporting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Exports</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Feedback Export Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Export Feedback Data</h2>
                    <form onSubmit={handleExportFeedback}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Export Format
                            </label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="xlsx"
                                        checked={feedbackForm.format === 'xlsx'}
                                        onChange={handleFeedbackFormChange}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">Excel (.xlsx)</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="csv"
                                        checked={feedbackForm.format === 'csv'}
                                        onChange={handleFeedbackFormChange}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">CSV (.csv)</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={feedbackForm.startDate}
                                    onChange={handleFeedbackFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={feedbackForm.endDate}
                                    onChange={handleFeedbackFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={feedbackForm.status}
                                    onChange={handleFeedbackFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                    <option value="reopened">Reopened</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={feedbackForm.priority}
                                    onChange={handleFeedbackFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Categories
                            </label>
                            <div className="max-h-40 overflow-y-auto border rounded p-2">
                                {loading ? (
                                    <p className="text-gray-500 text-sm">Loading categories...</p>
                                ) : Array.isArray(availableCategories) && availableCategories.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No categories available</p>
                                ) : (
                                    Array.isArray(availableCategories) && availableCategories.map((category) => (
                                        <div key={category?.id || Math.random()} className="mb-1">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={feedbackForm.categories.includes(category?.id)}
                                                    onChange={() => handleCategoryChange(category?.id)}
                                                    className="form-checkbox h-4 w-4 text-blue-600"
                                                />
                                                <span className="ml-2 text-gray-700">{category?.name || 'Unnamed Category'}</span>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                        </svg>
                                        Export Feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Analytics Export Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Export Analytics Data</h2>
                    <form onSubmit={handleExportAnalytics}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Export Format
                            </label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="xlsx"
                                        checked={analyticsForm.format === 'xlsx'}
                                        onChange={handleAnalyticsFormChange}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">Excel (.xlsx)</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="format"
                                        value="csv"
                                        checked={analyticsForm.format === 'csv'}
                                        onChange={handleAnalyticsFormChange}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">CSV (.csv)</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={analyticsForm.startDate}
                                    onChange={handleAnalyticsFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={analyticsForm.endDate}
                                    onChange={handleAnalyticsFormChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                                disabled={analyticsExporting}
                            >
                                {analyticsExporting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                        Export Analytics
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Exports;