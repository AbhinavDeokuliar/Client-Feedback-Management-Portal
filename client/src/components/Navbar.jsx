import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaChartLine, FaClipboardList, FaCommentAlt, FaCog, FaSignOutAlt,
    FaUserCircle, FaUsers, FaBell, FaFolder, FaFileExport, FaComments
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Navbar = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    // Track window width for responsive design
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // Fetch notifications based on user role
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                // This would be replaced with your actual API endpoint
                const response = await axios.get('/api/notifications');
                setNotifications(response.data.data || []);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        // Set up polling for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);

        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = async () => {
        try {
            await axios.get('/api/auth/logout');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // User role determination for conditional rendering of navigation items
    const isAdmin = user?.role === 'admin'; // Admin users get access to management features
    const isClient = user?.role === 'client'; // Clients can submit and track their feedback
    const isTeamMember = ['manager', 'support', 'developer', 'qa'].includes(user?.role); // Team members handle feedback

    // Animation settings for navigation items using Framer Motion
    const navItemVariants = {
        hover: { scale: 1.05, color: '#3182ce' }, // Slightly grow and change color on hover
        tap: { scale: 0.95 } // Slightly shrink when clicked
    };

    // Custom breakpoint check
    const isLargeScreen = windowWidth >= 1270;

    // Reusable NavLink component to maintain consistent styling and behavior
    const NavLink = ({ to, icon, text, isMobile = false }) => (
        <motion.div
            variants={navItemVariants}
            whileHover="hover"
            whileTap="tap"
            className="relative group"
        >
            <Link
                to={to}
                className={`flex items-center ${isMobile ? 'p-4 border-b border-gray-100' : 'p-2 md:p-2 lg:p-3'} text-gray-700 hover:bg-blue-50 rounded-md transition duration-200`}
                onClick={() => setIsOpen(false)} // Close mobile menu when a link is clicked
                title={text || to.split('/').pop()} // Use text as tooltip or fallback to path
            >
                {icon}
                {text && <span className={`${isMobile ? 'ml-4 text-base' : 'ml-3 hidden'}`} style={{ display: isMobile || isLargeScreen ? 'block' : 'none' }}>{text}</span>}
            </Link>
            {/* Animated underline effect on hover */}
            <motion.div
                className="absolute h-0.5 w-0 bg-blue-500 bottom-0 left-0 group-hover:w-full"
                transition={{ duration: 0.2 }}
            />
        </motion.div>
    );

    return (
        <nav className="bg-white shadow-md">
            {/* Main navigation container */}
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8">
                {/* Responsive container with padding */}
                <div className="flex justify-between h-16">
                    {/* Layout for logo and menu items */}
                    <div className="flex items-center">
                        {/* Logo container - responsive based on custom breakpoint */}
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <FaComments className="h-8 w-auto text-blue-600" size={28} />
                            <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">
                                <span style={{ display: isLargeScreen ? 'inline' : 'none' }}>Feedback Portal</span>
                                <span style={{ display: !isLargeScreen && windowWidth >= 768 ? 'inline' : 'none' }}>Feedback</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - adjusted spacing and padding */}
                    <div className="hidden md:flex md:items-center md:justify-end md:flex-1 md:space-x-0.5 lg:space-x-4">
                        {/* Render navigation items when user is logged in */}
                        {user && (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    icon={<FaChartLine className="text-gray-600 flex-shrink-0" size={18} />}
                                    text="Dashboard"
                                />

                                {/* Client Navigation Items */}
                                {isClient && (
                                    <>
                                        <NavLink
                                            to="/feedback/new"
                                            icon={<FaCommentAlt className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Submit Feedback"
                                        />
                                        <NavLink
                                            to="/my-feedback"
                                            icon={<FaClipboardList className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="My Feedback"
                                        />
                                    </>
                                )}

                                {/* Admin Navigation Items */}
                                {isAdmin && (
                                    <>
                                        <NavLink
                                            to="/admin/feedback"
                                            icon={<FaClipboardList className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="All Feedback"
                                        />
                                        <NavLink
                                            to="/admin/users"
                                            icon={<FaUsers className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Users"
                                        />
                                        <NavLink
                                            to="/admin/categories"
                                            icon={<FaFolder className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Categories"
                                        />
                                        <NavLink
                                            to="/admin/analytics"
                                            icon={<FaChartLine className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Analytics"
                                        />
                                        <NavLink
                                            to="/admin/exports"
                                            icon={<FaFileExport className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Exports"
                                        />
                                    </>
                                )}

                                {/* Team Member Navigation Items */}
                                {isTeamMember && (
                                    <>
                                        <NavLink
                                            to="/team/assigned"
                                            icon={<FaClipboardList className="text-gray-600 flex-shrink-0" size={18} />}
                                            text="Assigned Feedback"
                                        />
                                        {user?.role === 'manager' && (
                                            <NavLink
                                                to="/team/analytics"
                                                icon={<FaChartLine className="text-gray-600 flex-shrink-0" size={18} />}
                                                text="Team Analytics"
                                            />
                                        )}
                                    </>
                                )}

                                {/* Notifications dropdown */}
                                <div className="relative px-0.5 md:px-1">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
                                        title="Notifications"
                                    >
                                        <FaBell size={18} />
                                        {notifications.length > 0 && (
                                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </motion.button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10 max-h-96 overflow-y-auto">
                                            <div className="px-4 py-2 text-sm font-semibold border-b">Notifications</div>
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <motion.div
                                                        key={notification.id}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => {
                                                            setShowNotifications(false);
                                                            navigate(notification.link);
                                                        }}
                                                    >
                                                        <div className="font-medium text-sm">{notification.title}</div>
                                                        <div className="text-xs text-gray-500">{notification.message}</div>
                                                        <div className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* User profile button - using tooltip on md screens */}
                                <div className="relative px-0.5 md:px-1">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="p-1 border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150"
                                            title="Profile"
                                        >
                                            {user.profileImage ? (
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    src={user.profileImage}
                                                    alt="User avatar"
                                                />
                                            ) : (
                                                <FaUserCircle size={28} className="text-gray-600" />
                                            )}
                                        </button>
                                    </motion.div>
                                </div>

                                {/* Logout button - visible only on large screens (1270px+) */}
                                <motion.button
                                    whileHover={{ scale: 1.05, color: '#E53E3E' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="items-center text-gray-700 hover:text-red-600 focus:outline-none transition duration-150 ml-2 px-2"
                                    style={{ display: isLargeScreen ? 'flex' : 'none' }}
                                >
                                    <FaSignOutAlt size={18} />
                                    <span className="ml-2">Logout</span>
                                </motion.button>

                                {/* Simplified logout for medium screens with tooltip */}
                                <motion.button
                                    whileHover={{ scale: 1.05, color: '#E53E3E' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="flex items-center p-2 text-gray-700 hover:text-red-600 focus:outline-none transition duration-150"
                                    title="Logout"
                                    style={{ display: isLargeScreen ? 'none' : 'flex' }}
                                >
                                    <FaSignOutAlt size={18} />
                                </motion.button>
                            </>
                        )}

                        {/* Login/Register links when no user is logged in */}
                        {!user && (
                            <>
                                <NavLink
                                    to="/login"
                                    icon={<FaUserCircle className="text-gray-600" size={18} />}
                                    text="Login"
                                />
                                <NavLink
                                    to="/register"
                                    icon={<FaUserCircle className="text-gray-600" size={18} />}
                                    text="Register"
                                />
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="md:hidden bg-white border-t"
                >
                    <div className="pt-2 pb-3 space-y-1">
                        {/* Mobile navigation for logged in users */}
                        {user ? (
                            <>
                                <NavLink
                                    to="/dashboard"
                                    icon={<FaChartLine className="text-gray-600" size={18} />}
                                    text="Dashboard"
                                    isMobile={true}
                                />

                                {/* Client Mobile Navigation Items */}
                                {isClient && (
                                    <>
                                        <NavLink
                                            to="/feedback/new"
                                            icon={<FaCommentAlt className="text-gray-600" size={18} />}
                                            text="Submit Feedback"
                                            isMobile={true}
                                        />
                                        <NavLink
                                            to="/my-feedback"
                                            icon={<FaClipboardList className="text-gray-600" size={18} />}
                                            text="My Feedback"
                                            isMobile={true}
                                        />
                                    </>
                                )}

                                {/* Admin Mobile Navigation Items */}
                                {isAdmin && (
                                    <>
                                        <NavLink
                                            to="/admin/feedback"
                                            icon={<FaClipboardList className="text-gray-600" size={18} />}
                                            text="All Feedback"
                                            isMobile={true}
                                        />
                                        <NavLink
                                            to="/admin/users"
                                            icon={<FaUsers className="text-gray-600" size={18} />}
                                            text="Users"
                                            isMobile={true}
                                        />
                                        <NavLink
                                            to="/admin/categories"
                                            icon={<FaFolder className="text-gray-600" size={18} />}
                                            text="Categories"
                                            isMobile={true}
                                        />
                                        <NavLink
                                            to="/admin/analytics"
                                            icon={<FaChartLine className="text-gray-600" size={18} />}
                                            text="Analytics"
                                            isMobile={true}
                                        />
                                        <NavLink
                                            to="/admin/exports"
                                            icon={<FaFileExport className="text-gray-600" size={18} />}
                                            text="Exports"
                                            isMobile={true}
                                        />
                                    </>
                                )}

                                {/* Team Member Mobile Navigation Items */}
                                {isTeamMember && (
                                    <>
                                        <NavLink
                                            to="/team/assigned"
                                            icon={<FaClipboardList className="text-gray-600" size={18} />}
                                            text="Assigned Feedback"
                                            isMobile={true}
                                        />
                                        {user?.role === 'manager' && (
                                            <NavLink
                                                to="/team/analytics"
                                                icon={<FaChartLine className="text-gray-600" size={18} />}
                                                text="Team Analytics"
                                                isMobile={true}
                                            />
                                        )}
                                    </>
                                )}

                                <NavLink
                                    to="/profile"
                                    icon={<FaUserCircle className="text-gray-600" size={18} />}
                                    text="Profile"
                                    isMobile={true}
                                />

                                <div className="px-3 py-2">
                                    <motion.button
                                        whileHover={{ scale: 1.05, color: '#E53E3E' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="flex w-full items-center p-4 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition duration-200"
                                    >
                                        <FaSignOutAlt size={18} />
                                        <span className="ml-4 text-base">Logout</span>
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Mobile navigation for guests */}
                                <NavLink
                                    to="/login"
                                    icon={<FaUserCircle className="text-gray-600" size={18} />}
                                    text="Login"
                                    isMobile={true}
                                />
                                <NavLink
                                    to="/register"
                                    icon={<FaUserCircle className="text-gray-600" size={18} />}
                                    text="Register"
                                    isMobile={true}
                                />
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
