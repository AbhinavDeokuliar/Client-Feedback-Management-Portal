import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaBuilding, FaEnvelope, FaUserTie, FaIndustry } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { AuthService } from '../services/Api';

/**
 * Registration Component
 * 
 * This is a public route that allows new clients to register for an account.
 * Only client users can register through this form - admin and team member accounts 
 * must be created by existing administrators through the admin panel.
 */
const Registration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companySize: '',
        industry: '',
        role: 'client', // Default role is client
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Company size options
    const companySizes = [
        { value: '1-10', label: '1-10 employees' },
        { value: '11-50', label: '11-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-500', label: '201-500 employees' },
        { value: '501-1000', label: '501-1000 employees' },
        { value: '1000+', label: '1000+ employees' },
    ];

    // Industry options
    const industries = [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Retail',
        'Manufacturing',
        'Entertainment',
        'Transportation',
        'Construction',
        'Energy',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear field error when user starts typing again
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }

        // Clear API error when user makes any change
        if (apiError) setApiError(null);
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Company name validation
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        // Company size validation
        if (!formData.companySize) {
            newErrors.companySize = 'Please select company size';
        }

        // Industry validation
        if (!formData.industry) {
            newErrors.industry = 'Please select your industry';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            await AuthService.register(formData);

            // Registration successful - redirect to login with success message
            navigate('/login', {
                state: {
                    registrationSuccess: true,
                    message: 'Registration successful! Please sign in with your new account.'
                }
            });
        } catch (err) {
            console.error('Registration error:', err);
            setApiError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
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
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900">
                {/* Background glowing orbs */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-400 blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
                </div>
            </div>

            {/* Animated particles */}
            {renderParticles()}

            <div className="relative z-10">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl"
                    >
                        {/* REGISTRATION FORM CONTENT */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 relative"
                        >
                            {/* HEADER WITH ICON */}
                            <div className="text-center mb-8 relative z-10">
                                {/* APP LOGO */}
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="inline-block p-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 shadow-xl"
                                >
                                    <FaUserTie className="text-white text-3xl" />
                                </motion.div>

                                {/* REGISTRATION TITLE */}
                                <motion.h1
                                    initial={{ y: -10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold mt-4"
                                >
                                    Create Your Account
                                </motion.h1>

                                {/* COLORED UNDERLINE */}
                                <motion.div
                                    className="h-1 w-16 bg-indigo-500 mx-auto mt-2 rounded-full"
                                    layoutId="underline"
                                />

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-gray-600 mt-2"
                                >
                                    Register to submit and track your feedback
                                </motion.p>
                            </div>

                            {/* REGISTRATION FORM */}
                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                                {/* API ERROR MESSAGE */}
                                <AnimatePresence>
                                    {apiError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                                        >
                                            {apiError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* TWO COLUMN LAYOUT FOR DESKTOP */}
                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* NAME FIELD */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
                                        <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                            ${errors.name ? 'border-red-500' : formData.name ? 'border-indigo-500' : 'border-gray-200'}
                                            focus-within:border-indigo-500 transition-colors`}
                                        >
                                            <FaUser className={`mr-2 ${errors.name ? 'text-red-500' : formData.name ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full outline-none"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </motion.div>

                                    {/* EMAIL FIELD */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                                        <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                            ${errors.email ? 'border-red-500' : formData.email ? 'border-indigo-500' : 'border-gray-200'}
                                            focus-within:border-indigo-500 transition-colors`}
                                        >
                                            <FaEnvelope className={`mr-2 ${errors.email ? 'text-red-500' : formData.email ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full outline-none"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </motion.div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* PASSWORD FIELD */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                                        <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                            ${errors.password ? 'border-red-500' : formData.password ? 'border-indigo-500' : 'border-gray-200'}
                                            focus-within:border-indigo-500 transition-colors`}
                                        >
                                            <FaLock className={`mr-2 ${errors.password ? 'text-red-500' : formData.password ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full outline-none"
                                                placeholder="Create a password"
                                            />
                                        </div>
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                        {!errors.password && formData.password && (
                                            <p className="text-green-500 text-xs mt-1">Password strength: Good</p>
                                        )}
                                    </motion.div>

                                    {/* CONFIRM PASSWORD FIELD */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
                                        <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                            ${errors.confirmPassword ? 'border-red-500' : formData.confirmPassword ? 'border-indigo-500' : 'border-gray-200'}
                                            focus-within:border-indigo-500 transition-colors`}
                                        >
                                            <FaLock className={`mr-2 ${errors.confirmPassword ? 'text-red-500' : formData.confirmPassword ? 'text-indigo-500' : 'text-gray-400'}`} />
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full outline-none"
                                                placeholder="Confirm your password"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                    </motion.div>
                                </div>

                                {/* COMPANY INFORMATION */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    className="border-t pt-5 mt-5"
                                >
                                    <h3 className="text-lg font-medium mb-4">Company Information</h3>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        {/* COMPANY NAME */}
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="companyName">Company Name</label>
                                            <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                                ${errors.companyName ? 'border-red-500' : formData.companyName ? 'border-indigo-500' : 'border-gray-200'}
                                                focus-within:border-indigo-500 transition-colors`}
                                            >
                                                <FaBuilding className={`mr-2 ${errors.companyName ? 'text-red-500' : formData.companyName ? 'text-indigo-500' : 'text-gray-400'}`} />
                                                <input
                                                    id="companyName"
                                                    name="companyName"
                                                    type="text"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    className="w-full outline-none"
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                                        </div>

                                        {/* COMPANY SIZE */}
                                        <div>
                                            <label className="block text-gray-700 mb-2" htmlFor="companySize">Company Size</label>
                                            <div className={`border-2 rounded-lg px-3 py-2 bg-white
                                                ${errors.companySize ? 'border-red-500' : formData.companySize ? 'border-indigo-500' : 'border-gray-200'}
                                                focus-within:border-indigo-500 transition-colors`}
                                            >
                                                <select
                                                    id="companySize"
                                                    name="companySize"
                                                    value={formData.companySize}
                                                    onChange={handleChange}
                                                    className="w-full outline-none bg-transparent"
                                                >
                                                    <option value="">Select company size</option>
                                                    {companySizes.map((size) => (
                                                        <option key={size.value} value={size.value}>
                                                            {size.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
                                        </div>
                                    </div>

                                    {/* INDUSTRY */}
                                    <div className="mt-5">
                                        <label className="block text-gray-700 mb-2" htmlFor="industry">Industry</label>
                                        <div className={`border-2 rounded-lg px-3 py-2 bg-white
                                            ${errors.industry ? 'border-red-500' : formData.industry ? 'border-indigo-500' : 'border-gray-200'}
                                            focus-within:border-indigo-500 transition-colors`}
                                        >
                                            <div className="flex items-center">
                                                <FaIndustry className={`mr-2 ${errors.industry ? 'text-red-500' : formData.industry ? 'text-indigo-500' : 'text-gray-400'}`} />
                                                <select
                                                    id="industry"
                                                    name="industry"
                                                    value={formData.industry}
                                                    onChange={handleChange}
                                                    className="w-full outline-none bg-transparent"
                                                >
                                                    <option value="">Select your industry</option>
                                                    {industries.map((industry) => (
                                                        <option key={industry} value={industry}>
                                                            {industry}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
                                    </div>
                                </motion.div>

                                {/* REGISTER BUTTON */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1.0 }}
                                    className="mt-8"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 rounded-lg font-medium shadow-md transition-all"
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
                                                Create Account
                                            </motion.span>
                                        )}
                                    </motion.button>
                                </motion.div>

                                {/* LOGIN LINK */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.1 }}
                                    className="text-center mt-6"
                                >
                                    <span className="text-gray-600">Already have an account? </span>
                                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                                        Sign in
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
                        transition={{ delay: 1.2 }}
                    >
                        <p>© 2023 DC Infotech Solutions. All rights reserved.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Registration;