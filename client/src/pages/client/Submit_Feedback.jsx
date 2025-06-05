import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaTimesCircle, FaPaperclip, FaCheck } from 'react-icons/fa';
import { CategoryService, FeedbackService } from '../../services/Api';
import { useNavigate } from 'react-router-dom';

// Animated Background Component (similar to Dashboard)
const AnimatedBackground = () => {
    const particleCount = 20;
    const particles = Array.from({ length: particleCount });

    return (
        <div className="fixed inset-0 top-16 overflow-hidden z-0 pointer-events-none">
            {particles.map((_, i) => {
                const size = Math.random() * 40 + 15;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const delay = Math.random() * 2;
                const duration = Math.random() * 8 + 6;

                const colorClasses = [
                    "bg-blue-500/10", "bg-blue-400/10", "bg-blue-600/10",
                    "bg-indigo-500/10", "bg-sky-500/10", "bg-cyan-500/10"
                ];

                const colorIndex = Math.floor(Math.random() * colorClasses.length);

                return (
                    <motion.div
                        key={`particle-${i}`}
                        className={`absolute rounded-full shadow-lg backdrop-blur-sm ${colorClasses[colorIndex]}`}
                        style={{
                            width: size,
                            height: size,
                            left: `${x}%`,
                            top: `${y}%`,
                        }}
                        initial={{ opacity: 0.4, scale: 0.8 }}
                        animate={{
                            x: [0, Math.random() * 40 - 20],
                            y: [0, Math.random() * 40 - 20],
                            scale: [1, Math.random() * 0.3 + 0.85, 1],
                            opacity: [0.4, 0.6, 0.4]
                        }}
                        transition={{
                            duration: duration,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: delay
                        }}
                    />
                );
            })}
        </div>
    );
};

const Submit_Feedback = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        categoryId: '',
        priority: 'medium',
        attachments: []
    });

    // Get all categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await CategoryService.getAllCategories(true);
                setCategories(response.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Handle file uploads
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate file size (max 10MB per file)
        const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);

        // Check if we have too many files (max 5)
        const totalFiles = [...formData.attachments, ...validFiles];
        if (totalFiles.length > 5) {
            setFormErrors({
                ...formErrors,
                attachments: 'Maximum 5 files allowed'
            });
            return;
        }

        // If some files were too large
        if (validFiles.length < files.length) {
            setFormErrors({
                ...formErrors,
                attachments: 'Some files exceeded the 10MB limit'
            });
        } else {
            // Clear attachment error
            const newErrors = { ...formErrors };
            delete newErrors.attachments;
            setFormErrors(newErrors);
        }

        setFormData({
            ...formData,
            attachments: [...formData.attachments, ...validFiles]
        });
    };

    // Remove a selected file
    const handleRemoveFile = (index) => {
        const updatedFiles = [...formData.attachments];
        updatedFiles.splice(index, 1);
        setFormData({
            ...formData,
            attachments: updatedFiles
        });
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            errors.title = 'Title must be at least 5 characters';
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }

        if (!formData.categoryId) {
            errors.categoryId = 'Please select a category';
        }

        return errors;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            await FeedbackService.createFeedback(formData);

            setIsSubmitting(false);
            setSubmitSuccess(true);

            // Reset form
            setTimeout(() => {
                navigate('/client/dashboard');
            }, 2000);

        } catch (error) {
            console.error('Error submitting feedback:', error);
            setIsSubmitting(false);
            setFormErrors({
                submit: error.message || 'Failed to submit feedback. Please try again.'
            });
        }
    };

    return (
        <div className="p-4 relative">
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Main form container */}
            <motion.section
                className="w-full max-w-4xl mx-auto transition-all duration-300 z-10 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Notebook container with binding - using only Tailwind */}
                <div className="relative bg-blue-50 rounded-lg shadow-lg overflow-hidden flex border border-blue-200">
                    {/* Left binding/spine of notebook */}
                    <div className="w-8 bg-gradient-to-r from-blue-700 to-blue-500 relative">
                        {/* Binding holes - using only Tailwind */}
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[12%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[28%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[44%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[60%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[76%] shadow-inner"></div>
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 absolute left-2 top-[92%] shadow-inner"></div>
                    </div>

                    {/* Notebook content area */}
                    <div className="flex-1 p-6 bg-blue-50 relative">
                        {/* Notebook ruled lines using Tailwind's background */}
                        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(251,_246,_219,_0)_0%,rgba(251,_246,_219,_0)_24px,rgba(226,_232,_240,_0.5)_24px,rgba(226,_232,_240,_0.5)_25px)] bg-[size:100%_25px] pointer-events-none"></div>

                        {/* Notebook title */}
                        <h2 className="font-serif italic text-3xl mb-6 text-blue-900 text-center font-bold relative">
                            Submit Feedback
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-36 h-0.5 bg-blue-700/60"></div>
                        </h2>

                        {submitSuccess ? (
                            <motion.div
                                className="text-center py-12"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                                    <FaCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-serif italic text-blue-900 mb-4">Thank You!</h3>
                                <p className="text-gray-700">Your feedback has been submitted successfully.</p>
                                <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="relative z-10">
                                {/* Title Field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-serif italic text-blue-800 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-blue-50 border rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition-all
                                        ${formErrors.title ? 'border-red-300' : 'border-blue-200'}`}
                                        placeholder="Brief title describing your feedback"
                                    />
                                    {formErrors.title && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                    )}
                                </div>

                                {/* Category Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-serif italic text-blue-800 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-blue-50 border rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition-all
                                        ${formErrors.categoryId ? 'border-red-300' : 'border-blue-200'}`}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.categoryId && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>
                                    )}
                                </div>

                                {/* Priority Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-serif italic text-blue-800 mb-2">
                                        Priority
                                    </label>
                                    <div className="flex space-x-4">
                                        {['low', 'medium', 'high', 'critical'].map(priority => (
                                            <label key={priority} className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={priority}
                                                    checked={formData.priority === priority}
                                                    onChange={handleInputChange}
                                                    className="form-radio text-blue-600 h-4 w-4 focus:ring-2 focus:ring-blue-300"
                                                />
                                                <span className={`ml-2 capitalize ${priority === 'low' ? 'text-green-600' :
                                                    priority === 'medium' ? 'text-yellow-600' :
                                                        priority === 'high' ? 'text-orange-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {priority}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Description Field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-serif italic text-blue-800 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="6"
                                        className={`w-full px-4 py-2 bg-blue-50 border rounded-md focus:ring focus:ring-blue-200 focus:outline-none transition-all
                                        ${formErrors.description ? 'border-red-300' : 'border-blue-200'}`}
                                        placeholder="Please provide a detailed description..."
                                    ></textarea>
                                    {formErrors.description && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                    )}
                                </div>

                                {/* File Attachments */}
                                <div className="mb-6">
                                    <label className="block text-sm font-serif italic text-blue-800 mb-2">
                                        Attachments <span className="text-gray-500 text-xs">(Optional, max 5 files, 10MB each)</span>
                                    </label>

                                    {/* File Upload Area */}
                                    <div className="mb-3">
                                        <label
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-blue-50/50 transition-colors
                                            ${formErrors.attachments ? 'border-red-300' : 'border-blue-200'}`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FaCloudUploadAlt className="w-10 h-10 text-blue-400 mb-2" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Screenshots, documents or other relevant files
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                            />
                                        </label>
                                        {formErrors.attachments && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.attachments}</p>
                                        )}
                                    </div>

                                    {/* File List */}
                                    {formData.attachments.length > 0 && (
                                        <ul className="space-y-2 mt-3">
                                            {formData.attachments.map((file, index) => (
                                                <li key={index} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                                                    <div className="flex items-center">
                                                        <FaPaperclip className="text-blue-400 mr-2" />
                                                        <span className="text-sm truncate max-w-[200px] md:max-w-[300px]">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <FaTimesCircle />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Submit Error */}
                                {formErrors.submit && (
                                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                                        {formErrors.submit}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end mt-8">
                                    <motion.button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 font-serif italic"
                                        disabled={isSubmitting}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : "Submit Feedback"}
                                    </motion.button>
                                </div>
                            </form>
                        )}

                        {/* Page corner fold effect with pure Tailwind */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/70 shadow-md transform rotate-45 translate-x-6 -translate-y-6"></div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Submit_Feedback;