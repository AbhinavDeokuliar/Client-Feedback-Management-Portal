import { useState, useEffect } from 'react';
import { UserService } from '../services/Api';
import { FaUser, FaEnvelope, FaBriefcase, FaBuilding, FaIndustry, FaCalendarAlt, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await UserService.getCurrentUser();
                setUser(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load profile data');
                setLoading(false);
                console.error('Error fetching user data:', err);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Format date function
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate random background color based on name
    const getColorFromName = (name) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
            'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];

        // Simple hash to get consistent color for the same name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // Get first letter for avatar
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Should we use letter avatar instead of image?
    const useLetterAvatar = !user?.profileImage || user?.profileImage === 'default-avatar.png';

    // Get role color and badge
    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-600 text-white';
            case 'staff':
                return 'bg-blue-600 text-white';
            case 'client':
                return 'bg-green-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <h1 className="text-2xl font-bold">My Profile</h1>
                    <p className="opacity-80">View and manage your account information</p>
                </div>

                {/* Profile Information Section */}
                <div className="p-6 md:flex">
                    {/* Avatar Section */}
                    <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
                        <div className="relative">
                            {useLetterAvatar ? (
                                <div className={`w-40 h-40 rounded-full flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-md ${getColorFromName(user?.name || 'User')}`}>
                                    {getInitial(user?.name)}
                                </div>
                            ) : (
                                <img
                                    src={`http://localhost:5000/uploads/avatars/${user?.profileImage}`}
                                    alt={user?.name || "User"}
                                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                                />
                            )}
                            <span className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user?.role)}`}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </div>

                        <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
                        <p className="text-gray-600">{user?.email}</p>

                        <div className="mt-4 flex items-center">
                            <span className="mr-2">Email Verification:</span>
                            {user?.isEmailVerified ? (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-sm">
                                    <FaCheck className="mr-1" /> Verified
                                </span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center text-sm">
                                    <FaTimes className="mr-1" /> Not Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="md:w-2/3 md:pl-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Company Information */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Company Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FaBuilding className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Company Name</p>
                                            <p className="font-medium">{user?.companyName || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaBriefcase className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Company Size</p>
                                            <p className="font-medium">{user?.companySize || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaIndustry className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Industry</p>
                                            <p className="font-medium">{user?.industry || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {user?.department && user?.department !== 'n/a' && (
                                        <div className="flex items-center">
                                            <FaBriefcase className="text-gray-500 mr-2" />
                                            <div>
                                                <p className="text-sm text-gray-500">Department</p>
                                                <p className="font-medium">{user?.department}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Account Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Member Since</p>
                                            <p className="font-medium">{formatDate(user?.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaCalendarAlt className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Last Login</p>
                                            <p className="font-medium">{formatDate(user?.lastLogin)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <FaLock className="text-gray-500 mr-2" />
                                        <div>
                                            <p className="text-sm text-gray-500">Account Status</p>
                                            <p className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                {user?.isActive ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out flex items-center">
                                <FaUser className="mr-2" /> Edit Profile
                            </button>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out flex items-center">
                                <FaLock className="mr-2" /> Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;