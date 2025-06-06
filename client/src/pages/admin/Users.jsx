import React, { useState, useCallback, useEffect } from 'react';
import { UserService } from '../../services/Api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Custom hook for user data fetching
const useUserData = (type) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (type === 'client') {
                response = await UserService.getAllUsers(page);
                setTotalPages(response.pagination?.totalPages || 1);
            } else if (type === 'team') {
                response = await UserService.getTeamMembers();
            }

            setData(response?.data || []);
        } catch (error) {
            console.error(`Error fetching ${type} data:`, error);
            toast.error(`Failed to fetch ${type === 'client' ? 'users' : 'team members'}.`);
        } finally {
            setLoading(false);
        }
    }, [type, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, page, setPage, totalPages, refreshData: fetchData };
};

// Custom hook for user form state and submission
const useUserForm = (refreshData) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'support',
        department: 'customer_support'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'support',
            department: 'customer_support'
        });
    };

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        setIsSubmitting(true);
        try {
            // In real implementation, call API to create user
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

            toast.success('Team member created successfully!');
            handleClose();
            refreshData();
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(error.message || 'Failed to create user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        open,
        formData,
        isSubmitting,
        handleOpen,
        handleClose,
        handleChange,
        handleSubmit
    };
};

// Display components using Tailwind CSS instead of MUI
const UserStatusBadge = ({ isVerified }) => (
    isVerified ? (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
        </span>
    ) : (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Unverified
        </span>
    )
);

const RoleBadge = ({ role }) => {
    const roleColors = {
        admin: 'bg-red-100 text-red-800',
        manager: 'bg-blue-100 text-blue-800',
        support: 'bg-green-100 text-green-800',
        developer: 'bg-purple-100 text-purple-800',
        qa: 'bg-orange-100 text-orange-800',
        client: 'bg-gray-100 text-gray-800'
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
            {role}
        </span>
    );
};

const Avatar = ({ name }) => {
    // Get first initial, uppercase it, and handle empty names
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    // Generate color based on name for consistent coloring per user
    const generateColor = (name) => {
        if (!name) return { background: '#e0e0e0', text: '#666666' };

        // Use simple hash function for consistent colors
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // List of vibrant background colors with good contrast for white text
        const backgrounds = [
            '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
            '#F44336', '#009688', '#673AB7', '#3F51B5',
            '#795548', '#607D8B', '#E91E63', '#00BCD4'
        ];

        // Use hash to pick a color
        const background = backgrounds[Math.abs(hash) % backgrounds.length];

        return { background, text: '#FFFFFF' };
    };

    const { background, text } = generateColor(name);

    // Only show the initial with colored background, no profile image option
    return (
        <div
            className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl shadow-sm"
            style={{ backgroundColor: background, color: text }}
            title={name || "User"}
        >
            {initial}
        </div>
    );
};

const Spinner = () => (
    <div className="flex justify-center p-12">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

// Tab component
const TabButton = ({ isActive, onClick, children }) => (
    <button
        className={`py-2 px-4 font-medium ${isActive
            ? 'text-indigo-600 border-b-2 border-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        onClick={onClick}
    >
        {children}
    </button>
);

// Main Users component
const Users = () => {
    const [activeTab, setActiveTab] = useState(0);
    const clientUsers = useUserData('client');
    const teamMembers = useUserData('team');
    const userForm = useUserForm(teamMembers.refreshData);

    // Only fetch data for active tab
    useEffect(() => {
        if (activeTab === 0) {
            clientUsers.refreshData();
        } else {
            teamMembers.refreshData();
        }
    }, [activeTab]);

    const handleTabChange = (tabIndex) => {
        setActiveTab(tabIndex);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

                {activeTab === 1 && (
                    <button
                        onClick={userForm.handleOpen}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md flex items-center shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Team Member
                    </button>
                )}
            </div>

            {/* Tabs and content */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <TabButton
                            isActive={activeTab === 0}
                            onClick={() => handleTabChange(0)}
                        >
                            Client Users
                        </TabButton>
                        <TabButton
                            isActive={activeTab === 1}
                            onClick={() => handleTabChange(1)}
                        >
                            Team Members
                        </TabButton>
                    </div>
                </div>

                <div className="p-4">
                    {(activeTab === 0 && clientUsers.loading) || (activeTab === 1 && teamMembers.loading) ? (
                        <Spinner />
                    ) : (
                        <>
                            {activeTab === 0 && (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {clientUsers.data.length > 0 ? (
                                                    clientUsers.data.map((user) => (
                                                        <tr key={user.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <Avatar name={user.name} />
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <RoleBadge role={user.role} />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.companyName || '-'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <UserStatusBadge isVerified={user.isEmailVerified} />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                    </svg>
                                                                </button>
                                                                <button className="text-red-600 hover:text-red-900">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                                                            No users found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {clientUsers.totalPages > 1 && (
                                        <div className="flex items-center justify-center py-4">
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => clientUsers.setPage(Math.max(1, clientUsers.page - 1))}
                                                    disabled={clientUsers.page === 1}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${clientUsers.page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {Array.from({ length: clientUsers.totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => clientUsers.setPage(page)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${clientUsers.page === page
                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => clientUsers.setPage(Math.min(clientUsers.totalPages, clientUsers.page + 1))}
                                                    disabled={clientUsers.page === clientUsers.totalPages}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${clientUsers.page === clientUsers.totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 1 && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {teamMembers.data.length > 0 ? (
                                                teamMembers.data.map((member) => (
                                                    <tr key={member.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Avatar name={member.name} />
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <RoleBadge role={member.role} />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {member.isActive ? (
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                                    Inactive
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                            <button className="text-red-600 hover:text-red-900">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No team members found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal for adding team member - shown when userForm.open is true */}
            {userForm.open && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Add New Team Member</h3>
                                <button onClick={userForm.handleClose} className="text-gray-400 hover:text-gray-500">
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={userForm.handleSubmit}>
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    Create a new internal team member account. These users will have access to the admin portal.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={userForm.formData.name}
                                            onChange={userForm.handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            required
                                            value={userForm.formData.email}
                                            onChange={userForm.handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                        <select
                                            name="role"
                                            id="role"
                                            required
                                            value={userForm.formData.role}
                                            onChange={userForm.handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="manager">Manager</option>
                                            <option value="support">Support</option>
                                            <option value="developer">Developer</option>
                                            <option value="qa">Quality Assurance</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                                        <select
                                            name="department"
                                            id="department"
                                            required
                                            value={userForm.formData.department}
                                            onChange={userForm.handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="management">Management</option>
                                            <option value="customer_support">Customer Support</option>
                                            <option value="development">Development</option>
                                            <option value="quality_assurance">Quality Assurance</option>
                                            <option value="product_management">Product Management</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            required
                                            value={userForm.formData.password}
                                            onChange={userForm.handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            required
                                            value={userForm.formData.confirmPassword}
                                            onChange={userForm.handleChange}
                                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${userForm.formData.password !== userForm.formData.confirmPassword && userForm.formData.confirmPassword !== ''
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                        />
                                        {userForm.formData.password !== userForm.formData.confirmPassword && userForm.formData.confirmPassword !== '' && (
                                            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 flex justify-end">
                                <button
                                    type="button"
                                    onClick={userForm.handleClose}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={userForm.isSubmitting || userForm.formData.password !== userForm.formData.confirmPassword}
                                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${userForm.isSubmitting || userForm.formData.password !== userForm.formData.confirmPassword
                                        ? 'bg-indigo-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        }`}
                                >
                                    {userForm.isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;