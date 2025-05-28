import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { FaUser, FaLock, FaUserTie, FaUserShield, FaBuilding, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [userType, setUserType] = useState('client');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Handle login logic here
            console.log('Logging in as', userType, 'with', formData);
        }, 1500);
    };

    const userTypeInfo = {
        client: {
            title: 'Client Login',
            icon: <FaBuilding className="text-blue-500 text-5xl" />,
            color: 'blue',
            bgPattern: 'bg-blue-50 bg-opacity-50',
            gradient: 'from-blue-400 to-blue-600',
            decoration: 'circles',
            bgColor: 'from-blue-900 to-blue-700',
            pageBg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
        },
        Team: {
            title: 'Team Login',
            icon: <FaChartLine className="text-green-500 text-5xl" />,
            color: 'green',
            bgPattern: 'bg-green-50 bg-opacity-50',
            gradient: 'from-green-400 to-green-600',
            decoration: 'squares',
            bgColor: 'from-green-900 to-green-700',
            pageBg: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)'
        },
        admin: {
            title: 'Admin Login',
            icon: <FaShieldAlt className="text-purple-500 text-5xl" />,
            color: 'purple',
            bgPattern: 'bg-purple-50 bg-opacity-50',
            gradient: 'from-purple-400 to-purple-600',
            decoration: 'triangles',
            bgColor: 'from-purple-900 to-purple-700',
            pageBg: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)'
        },
    };

    // Background patterns for each user type
    const renderDecoration = (decoration) => {
        switch (decoration) {
            case 'circles':
                return (
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-blue-400"
                                style={{
                                    width: `${Math.random() * 40 + 10}px`,
                                    height: `${Math.random() * 40 + 10}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    x: [0, Math.random() * 20 - 10],
                                    y: [0, Math.random() * 20 - 10],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 3 + Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>
                );
            case 'squares':
                return (
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-green-400"
                                style={{
                                    width: `${Math.random() * 30 + 10}px`,
                                    height: `${Math.random() * 30 + 10}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    rotate: Math.random() * 45,
                                }}
                                animate={{
                                    rotate: [0, 90],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 4 + Math.random() * 2,
                                }}
                            />
                        ))}
                    </div>
                );
            case 'triangles':
                return (
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute border-b-[20px] border-l-[12px] border-r-[12px] border-b-purple-500 border-l-transparent border-r-transparent"
                                style={{
                                    width: `${Math.random() * 20 + 10}px`,
                                    height: `${Math.random() * 20 + 10}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 8 + Math.random() * 4,
                                }}
                            />
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Dynamic Background Elements */}
            {Object.keys(userTypeInfo).map((type) => (
                <motion.div
                    key={`bg-${type}`}
                    className="absolute inset-0 z-0"
                    initial={false}
                    animate={{
                        opacity: userType === type ? 1 : 0,
                    }}
                    transition={{ duration: 0.8 }}
                    style={{
                        background: userTypeInfo[type].pageBg,
                        zIndex: 0
                    }}
                >
                    {/* Background decoration specific to each user type */}
                    {type === 'client' && (
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                            <div className="absolute bottom-40 right-20 w-80 h-80 rounded-full bg-white blur-3xl"></div>
                        </div>
                    )}
                    {type === 'Team' && (
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 right-20 w-72 h-72 rounded-lg bg-white blur-3xl rotate-45"></div>
                            <div className="absolute bottom-20 left-40 w-96 h-40 rounded-lg bg-white blur-3xl rotate-12"></div>
                        </div>
                    )}
                    {type === 'admin' && (
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-white blur-3xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-white blur-3xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
                        </div>
                    )}
                </motion.div>
            ))}

            <div className="relative z-10">
                <Navbar />

                <div className="container mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-2xl"
                    >
                        <div className="md:flex">
                            {/* Left Section: User Type Selection */}
                            <div className="bg-gray-50/90 backdrop-blur-sm p-8 md:w-1/3 relative">
                                <motion.h2
                                    className="text-2xl font-bold text-center mb-6"
                                    animate={{
                                        color: userTypeInfo[userType].color === 'blue' ? '#3B82F6' :
                                            userTypeInfo[userType].color === 'green' ? '#10B981' :
                                                '#8B5CF6'
                                    }}
                                    transition={{ duration: 0.5 }}
                                >
                                    User Type
                                </motion.h2>

                                <div className="space-y-4 relative z-10">
                                    {Object.keys(userTypeInfo).map((type) => (
                                        <motion.div
                                            key={type}
                                            whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`p-4 rounded-lg cursor-pointer transition-all relative overflow-hidden ${userType === type
                                                ? `bg-${userTypeInfo[type].color}-100 shadow-md`
                                                : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            onClick={() => setUserType(type)}
                                        >
                                            {userType === type && (
                                                <motion.div
                                                    className={`absolute inset-0 bg-gradient-to-r ${userTypeInfo[type].gradient} opacity-10`}
                                                    layoutId="highlight"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 0.2 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            )}

                                            <div className="flex items-center space-x-3 relative z-10">
                                                <motion.div
                                                    animate={{
                                                        color: userType === type ?
                                                            (userTypeInfo[type].color === 'blue' ? '#3B82F6' :
                                                                userTypeInfo[type].color === 'green' ? '#10B981' :
                                                                    '#8B5CF6') : '#6B7280'
                                                    }}
                                                    className="text-lg"
                                                >
                                                    {type === 'client' && <FaBuilding />}
                                                    {type === 'Team' && <FaChartLine />}
                                                    {type === 'admin' && <FaShieldAlt />}
                                                </motion.div>
                                                <span className="capitalize font-medium">{type}</span>

                                                {userType === type && (
                                                    <motion.div
                                                        className={`ml-auto bg-${userTypeInfo[type].color}-500 h-2 w-2 rounded-full`}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 15
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    className="mt-10 p-6 rounded-lg bg-opacity-50 relative overflow-hidden"
                                    animate={{
                                        backgroundColor: userTypeInfo[userType].color === 'blue' ? 'rgba(239, 246, 255, 0.7)' :
                                            userTypeInfo[userType].color === 'green' ? 'rgba(236, 253, 245, 0.7)' :
                                                'rgba(245, 243, 255, 0.7)'
                                    }}
                                    transition={{ duration: 0.5 }}
                                >

                                    {renderDecoration(userTypeInfo[userType].decoration)}
                                </motion.div>
                            </div>

                            {/* Right Section: Login Form */}
                            <motion.div
                                className={`p-8 md:w-2/3 relative`}
                                // RIGHT SECTION BACKGROUND COLOR
                                animate={{
                                    backgroundColor: userTypeInfo[userType].color === 'blue' ? 'rgba(239, 246, 255, 0.5)' :
                                        userTypeInfo[userType].color === 'green' ? 'rgba(236, 253, 245, 0.5)' :
                                            'rgba(245, 243, 255, 0.5)'
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* BACKGROUND DECORATIONS */}
                                <AnimatePresence>
                                    <motion.div
                                        key={`decoration-${userType}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0"
                                    >
                                        {renderDecoration(userTypeInfo[userType].decoration)}
                                    </motion.div>
                                </AnimatePresence>

                                {/* LOGIN FORM CONTENT */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={userType}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative z-10"
                                    >
                                        {/* HEADER WITH ICON */}
                                        <div className="text-center mb-8">
                                            {/* USER TYPE ICON */}
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.2, type: "spring" }}
                                                className={`inline-block p-5 rounded-full bg-gray-100 ${userTypeInfo[userType].gradient} shadow-xl`}
                                            >
                                                <motion.div
                                                    animate={{
                                                        color: "#FFFFFF"
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {userTypeInfo[userType].icon}
                                                </motion.div>
                                            </motion.div>

                                            {/* LOGIN TITLE */}
                                            <motion.h1
                                                initial={{ y: -10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="text-3xl font-bold mt-4"
                                            >
                                                {userTypeInfo[userType].title}
                                            </motion.h1>

                                            {/* COLORED UNDERLINE */}
                                            <motion.div
                                                className={`h-1 w-16 bg-${userTypeInfo[userType].color}-500 mx-auto mt-2 rounded-full`}
                                                layoutId="underline"
                                            />
                                        </div>

                                        {/* LOGIN FORM */}
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* EMAIL FIELD */}
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                                                <div className={`flex items-center border-2 rounded-lg px-3 py-2 bg-white
                                                    ${formData.email ? `border-${userTypeInfo[userType].color}-500` : 'border-gray-200'}
                                                    focus-within:border-${userTypeInfo[userType].color}-500 transition-colors`}
                                                >
                                                    <FaUser className={`mr-2 ${formData.email ? `text-${userTypeInfo[userType].color}-500` : 'text-gray-400'}`} />
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
                                                    ${formData.password ? `border-${userTypeInfo[userType].color}-500` : 'border-gray-200'}
                                                    focus-within:border-${userTypeInfo[userType].color}-500 transition-colors`}
                                                >
                                                    <FaLock className={`mr-2 ${formData.password ? `text-${userTypeInfo[userType].color}-500` : 'text-gray-400'}`} />
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

                                            {/* REMEMBER ME & FORGOT PASSWORD */}
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.7 }}
                                                className="flex items-center justify-between"
                                            >

                                                {/* FORGOT PASSWORD LINK */}
                                                <a href="#" className={`text-sm text-${userTypeInfo[userType].color}-600 hover:underline`}>
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
                                                    className={`w-full bg-gradient-to-r ${userTypeInfo[userType].gradient} text-white py-3 rounded-lg font-medium shadow-md transition-all`}
                                                    disabled={isLoading}
                                                    layoutId={`button-${userType}`}
                                                >
                                                    {/* LOADING INDICATOR */}
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
                                                            Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                                                        </motion.span>
                                                    )}
                                                </motion.button>
                                            </motion.div>
                                        </form>


                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </div>
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

            {/* ANIMATED BACKGROUND PARTICLES */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* CLIENT PARTICLES */}
                {userType === 'client' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        {[...Array(20)].map((_, i) => (
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
                    </motion.div>
                )}

                {/* TEAM PARTICLES */}
                {userType === 'Team' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                className="absolute bg-green-200"
                                style={{
                                    width: `${Math.random() * 12 + 4}px`,
                                    height: `${Math.random() * 12 + 4}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                                    rotate: `${Math.random() * 180}deg`,
                                }}
                                animate={{
                                    rotate: [0, 180],
                                    y: [0, Math.random() * -120 - 30],
                                    opacity: [0.7, 0]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 6 + Math.random() * 8,
                                    delay: Math.random() * 5,
                                }}
                            />
                        ))}
                    </motion.div>
                )}

                {/* ADMIN PARTICLES */}
                {userType === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={`particle-${i}`}
                                className="absolute bg-purple-200"
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${Math.random() * 8 + 4}px solid transparent`,
                                    borderRight: `${Math.random() * 8 + 4}px solid transparent`,
                                    borderBottom: `${Math.random() * 16 + 6}px solid rgba(216, 180, 254, 0.6)`,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    rotate: [0, 360],
                                    y: [0, Math.random() * -150 - 20],
                                    opacity: [0.7, 0]
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 7 + Math.random() * 10,
                                    delay: Math.random() * 5,
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Login;
