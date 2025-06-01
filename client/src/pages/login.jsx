import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaUser, FaLock, FaUserCircle, FaChartLine, FaComments } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { AuthService } from '../services/Api';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    // Get registration success message if coming from registration page
    const registrationSuccess = location.state?.registrationSuccess;
    const successMessage = location.state?.message;

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(registrationSuccess || false);

    // Hide success message after 5 seconds
    useEffect(() => {
        let timer;
        if (showSuccess) {
            timer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showSuccess]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await AuthService.login(formData);

            // Process the user data from response
            const userData = {
                id: response.data?.id || response.id,
                name: response.data?.name || response.name,
                email: response.data?.email || response.email,
                role: response.data?.role || response.role,
            };

            console.log('Login response:', response);

            // Pass the user data up to parent component
            onLogin(userData);

            // Navigate based on role
            const role = userData.role;
            let redirectPath;

            if (role === 'admin') {
                redirectPath = '/admin/dashboard';
            } else if (['manager', 'support', 'developer', 'qa'].includes(role)) {
                redirectPath = '/team/dashboard';
            } else {
                redirectPath = '/client/dashboard';
            }

            // Use the original 'from' if it was a protected route that triggered the login
            navigate(from !== "/" ? from : redirectPath);

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate random animated background particles
    const renderParticles = () => (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-blue-200"
                    style={{
                        width: `${Math.random() * 8 + 2}px`,
                        height: `${Math.random() * 8 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * -100 - 50],
                        x: [0, Math.random() * 50 - 25],
                        opacity: [0.7, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 5 + Math.random() * 7,
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`square-${i}`}
                    className="absolute bg-indigo-200"
                    style={{
                        width: `${Math.random() * 12 + 4}px`,
                        height: `${Math.random() * 12 + 4}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        rotate: Math.random() * 45,
                        borderRadius: Math.random() > 0.7 ? '50%' : '0%',
                    }}
                    animate={{
                        rotate: [0, 180],
                        y: [0, Math.random() * -120 - 30],
                        opacity: [0.6, 0]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8 + Math.random() * 10,
                        delay: Math.random() * 4,
                    }}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
                {/* Background glowing orbs */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-400 blur-3xl" />
                </div>

                {/* Animated particles */}
                {renderParticles()}
            </div>

            <div className="relative z-10">
                <Navbar />

                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl"
                    >
                        {/* LOGIN FORM CONTENT */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 relative"
                        >
                            {/* Registration success message */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                                    >
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                            </svg>
                                            <p>{successMessage || 'Registration successful! Please sign in with your new account.'}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* HEADER WITH ICON */}
                            <div className="text-center mb-8 relative z-10">
                                {/* APP LOGO */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="inline-block p-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl"
                                >
                                    <FaComments className="text-white text-4xl" />
                                </motion.div>

                                {/* LOGIN TITLE */}
                                <motion.h1
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold mt-4"
                                >
                                    Welcome Back
                                </motion.h1>

                                {/* COLORED UNDERLINE */}
                                <motion.div
                                    className="h-1 w-16 bg-blue-500 mx-auto mt-2 rounded-full"
                                    layoutId="underline"
                                />

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-gray-600 mt-2"
                                >
                                    Sign in to access your dashboard
                                </motion.p>
                            </div>

                            {/* LOGIN FORM */}
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                {/* EMAIL FIELD */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                                    <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                        ${formData.email ? 'border-blue-500' : 'border-gray-200'}
                                        focus-within:border-blue-500 transition-colors`}
                                    >
                                        <FaUser className={`mr-2 ${formData.email ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full outline-none"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </motion.div>

                                {/* PASSWORD FIELD */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                                    <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                        ${formData.password ? 'border-blue-500' : 'border-gray-200'}
                                        focus-within:border-blue-500 transition-colors`}
                                    >
                                        <FaLock className={`mr-2 ${formData.password ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full outline-none"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </motion.div>

                                {/* ERROR MESSAGE */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* FORGOT PASSWORD */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex items-center justify-end"
                                >
                                    <a href="#" className="text-sm text-blue-600 hover:underline">
                                        Forgot password?
                                    </a>
                                </motion.div>

                                {/* LOGIN BUTTON */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium shadow-md transition-all"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                Sign In
                                            </motion.span>
                                        )}
                                    </motion.button>
                                </motion.div>

                                {/* REGISTER LINK - Updated to use Link component */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="text-center mt-6"
                                >
                                    <span className="text-gray-600">Don't have an account? </span>
                                    <Link to="/register" className="text-blue-600 font-medium hover:underline">
                                        Sign up
                                    </Link>
                                </motion.div>
                            </form>
                        </motion.div>
                    </motion.div>

                    {/* PAGE FOOTER */}
                    <motion.div
                        className="mt-8 text-center text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                    >
                        <p>© 2023 DC Infotech Solutions. All rights reserved.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;