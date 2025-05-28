const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const User = require('../models/user.model');

/**
 * Middleware to protect routes - requires valid JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Get token from cookie
      token = req.cookies.jwt;
    }

    // If no token found, return unauthorized error
    if (!token) {
      return next(
        new ApiError(401, 'Not authorized to access this route. Please log in.')
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new ApiError(401, 'The user belonging to this token no longer exists.')
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return next(
        new ApiError(401, 'This user account has been deactivated.')
      );
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new ApiError(401, 'User recently changed password. Please log in again.')
      );
    }

    // Check if token was invalidated (user logged out)
    if (user.tokenInvalidatedAt && decoded.iat * 1000 < new Date(user.tokenInvalidatedAt).getTime()) {
      return next(
        new ApiError(401, 'You have been logged out. Please log in again.')
      );
    }

    // Grant access to protected route - add user to request
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired. Please log in again.'));
    }
    next(error);
  }
};

/**
 * Restrict access based on user role
 * @param {...String} roles - Roles allowed to access the route
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action')
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
