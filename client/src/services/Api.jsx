import axios from 'axios';

// Create axios instance with base URL and default headers
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

/**
 * Authentication Services
 * Handles user registration, login, logout, and account management
 */
const AuthService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data including name, email, password, etc.
   * @returns {Promise<Object>} User data with token
   */
  register: (userData) => API.post('/auth/register', userData),
  
  /**
   * Authenticate user and get token
   * @param {Object} credentials - User login credentials (email, password)
   * @returns {Promise<Object>} User data with authentication token
   */
  login: (credentials) => {
    return API.post('/auth/login', credentials)
      .then(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return response;
      });
  },
  
  /**
   * Logout current user and clear authentication token
   * @returns {Promise<Object>} Logout confirmation
   */
  logout: () => {
    localStorage.removeItem('token');
    return API.get('/auth/logout');
  },
  
  /**
   * Get profile of currently logged-in user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: () => API.get('/auth/me'),
  
  /**
   * Request password reset email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Request confirmation
   */
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  
  /**
   * Reset password using token from email
   * @param {string} resetToken - Password reset token
   * @param {Object} passwords - New password and confirmation
   * @returns {Promise<Object>} Password reset confirmation with new token
   */
  resetPassword: (resetToken, passwords) => API.put(`/auth/reset-password/${resetToken}`, passwords),
  
  /**
   * Update password when user is logged in
   * @param {Object} passwords - Current and new passwords
   * @returns {Promise<Object>} Password update confirmation with new token
   */
  updatePassword: (passwords) => API.put('/auth/update-password', passwords),
  
  /**
   * Verify user email address
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Email verification confirmation
   */
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`)
};

/**
 * User Management Services
 * Handles user listing and user information retrieval
 */
const UserService = {
  /**
   * Get all users with pagination (admin only)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Paginated list of users
   */
  getAllUsers: (page = 1, limit = 10) => API.get(`/users?page=${page}&limit=${limit}`),
  
  /**
   * Get all internal team members for task assignment
   * @returns {Promise<Object>} List of team members
   */
  getTeamMembers: () => API.get('/users/team'),
  
  /**
   * Get profile of currently logged-in user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: () => API.get('/users/me'),
};

/**
 * Feedback Services
 * Handles all feedback-related operations including CRUD, comments, attachments, and statistics
 */
const FeedbackService = {
  /**
   * Get all feedback with pagination and filtering
   * @param {Object} queryParams - Filter parameters (page, limit, status, priority, category, etc.)
   * @returns {Promise<Object>} Paginated list of feedback
   */
  getAllFeedback: (queryParams = {}) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    }
    return API.get(`/feedback?${params.toString()}`);
  },
  
  /**
   * Get detailed information about specific feedback
   * @param {string} id - Feedback ID
   * @returns {Promise<Object>} Detailed feedback data
   */
  getFeedbackById: (id) => API.get(`/feedback/${id}`),
  
  /**
   * Submit new feedback
   * @param {Object} feedbackData - Feedback data including title, description, attachments, etc.
   * @returns {Promise<Object>} Created feedback data
   */
  createFeedback: (feedbackData) => {
    // Handle multipart/form-data for file uploads
    const formData = new FormData();
    for (const key in feedbackData) {
      if (key === 'attachments') {
        for (const file of feedbackData.attachments) {
          formData.append('attachments', file);
        }
      } else if (key === 'tags' && Array.isArray(feedbackData.tags)) {
        formData.append('tags', JSON.stringify(feedbackData.tags));
      } else {
        formData.append(key, feedbackData[key]);
      }
    }
    return API.post('/feedback', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * Update existing feedback
   * @param {string} id - Feedback ID
   * @param {Object} feedbackData - Updated feedback data
   * @returns {Promise<Object>} Updated feedback data
   */
  updateFeedback: (id, feedbackData) => {
    // Handle multipart/form-data for file uploads
    const formData = new FormData();
    for (const key in feedbackData) {
      if (key === 'attachments') {
        for (const file of feedbackData.attachments) {
          formData.append('attachments', file);
        }
      } else if (key === 'tags' && Array.isArray(feedbackData.tags)) {
        formData.append('tags', JSON.stringify(feedbackData.tags));
      } else {
        formData.append(key, feedbackData[key]);
      }
    }
    return API.put(`/feedback/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * Permanently delete feedback (admin only)
   * @param {string} id - Feedback ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteFeedback: (id) => API.delete(`/feedback/${id}`),
  
  /**
   * Assign feedback to specific user (admin only)
   * @param {string} id - Feedback ID
   * @param {string} assignToUserId - User ID to assign feedback to
   * @returns {Promise<Object>} Updated feedback data
   */
  assignFeedback: (id, assignToUserId) => API.patch(`/feedback/${id}/assign`, { assignToUserId }),
  
  /**
   * Update feedback status
   * @param {string} id - Feedback ID
   * @param {string} status - New status (new, in-progress, resolved, closed, reopened)
   * @returns {Promise<Object>} Updated feedback data
   */
  changeFeedbackStatus: (id, status) => API.patch(`/feedback/${id}/status`, { status }),
  
  /**
   * Add comment to feedback
   * @param {string} id - Feedback ID
   * @param {Object} commentData - Comment text and optional attachments
   * @returns {Promise<Object>} Updated feedback with new comment
   */
  addComment: (id, commentData) => {
    // Handle multipart/form-data for file uploads
    const formData = new FormData();
    formData.append('text', commentData.text);
    if (commentData.attachments) {
      for (const file of commentData.attachments) {
        formData.append('attachments', file);
      }
    }
    return API.post(`/feedback/${id}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * Get all comments for a feedback
   * @param {string} id - Feedback ID
   * @returns {Promise<Object>} List of comments
   */
  getFeedbackComments: (id) => API.get(`/feedback/${id}/comments`),
  
  /**
   * Add additional attachments to feedback
   * @param {string} id - Feedback ID
   * @param {Array} files - Array of file objects
   * @returns {Promise<Object>} Updated feedback with new attachments
   */
  addAttachments: (id, files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('attachments', file);
    }
    return API.post(`/feedback/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  /**
   * Get change history of feedback
   * @param {string} id - Feedback ID
   * @returns {Promise<Object>} List of history entries
   */
  getFeedbackHistory: (id) => API.get(`/feedback/${id}/history`),
  
  /**
   * Get feedback analytics and statistics (admin only)
   * @param {string} startDate - Start date for filtering (YYYY-MM-DD)
   * @param {string} endDate - End date for filtering (YYYY-MM-DD)
   * @returns {Promise<Object>} Feedback statistics and analytics
   */
  getFeedbackStatistics: (startDate, endDate) => {
    let url = '/feedback/statistics/overview';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += `?${params.join('&')}`;
    return API.get(url);
  }
};

/**
 * Category Services
 * Handles feedback categories management
 */
const CategoryService = {
  /**
   * Get all feedback categories
   * @param {boolean} active - Filter by active status (optional)
   * @returns {Promise<Object>} List of categories
   */
  getAllCategories: (active) => {
    let url = '/categories';
    if (active !== undefined) {
      url += `?active=${active}`;
    }
    return API.get(url);
  },
  
  /**
   * Get detailed information about specific category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Detailed category data
   */
  getCategoryById: (id) => API.get(`/categories/${id}`),
  
  /**
   * Create new feedback category (admin only)
   * @param {Object} categoryData - Category name, description, and active status
   * @returns {Promise<Object>} Created category data
   */
  createCategory: (categoryData) => API.post('/categories', categoryData),
  
  /**
   * Update existing category (admin only)
   * @param {string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise<Object>} Updated category data
   */
  updateCategory: (id, categoryData) => API.put(`/categories/${id}`, categoryData),
  
  /**
   * Delete category (admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteCategory: (id) => API.delete(`/categories/${id}`),
  
  /**
   * Toggle category active status (admin only)
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Updated category data
   */
  toggleCategoryStatus: (id) => API.patch(`/categories/${id}/toggle-status`)
};

/**
 * Export Services
 * Handles data export functionality
 */
const ExportService = {
  /**
   * Generate export of feedback data in Excel or CSV format
   * @param {Object} exportOptions - Export options including format and filters
   * @returns {Promise<Object>} Export result with download URL
   */
  exportFeedbackData: (exportOptions) => API.post('/exports/feedback', exportOptions),
  
  /**
   * Generate export of feedback analytics in Excel or CSV format
   * @param {Object} exportOptions - Export options including format and date range
   * @returns {Promise<Object>} Export result with download URL
   */
  exportAnalyticsData: (exportOptions) => API.post('/exports/analytics', exportOptions),
  
  /**
   * Get history of exports with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} status - Filter by status (processing, completed, failed)
   * @returns {Promise<Object>} Paginated list of export history
   */
  getExportHistory: (page = 1, limit = 10, status) => {
    let url = `/exports/history?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return API.get(url);
  },
  
  /**
   * Download exported file
   * @param {string} id - Export ID
   * @returns {Promise<Object>} Simple success confirmation
   */
  downloadExport: (id) => {
    window.location.href = `${API.defaults.baseURL}/exports/download/${id}`;
    return Promise.resolve({ success: true });
  }
};

export {
  API,
  AuthService,
  UserService,
  FeedbackService,
  CategoryService,
  ExportService
};
