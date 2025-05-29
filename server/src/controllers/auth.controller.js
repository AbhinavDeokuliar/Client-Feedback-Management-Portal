const User = require("../models/user.model.js");
const { ApiError } = require("../middleware/error.middleware");
const crypto = require("crypto");
const logger = require("../config/logger");

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
	try {
		// Extract user data from request body
		const {
			name,
			email,
			password,
			role,
			companyName,
			companySize,
			industry,
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return next(new ApiError(400, "Email already in use"));
		}

		// Restrict admin role creation unless by existing admin
		if (role === "admin" && (!req.user || req.user.role !== "admin")) {
			return next(
				new ApiError(403, "Not authorized to create admin accounts")
			);
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
			role: role || "client",
			companyName,
			companySize,
			industry,
		});

		// Generate verification token
		const verificationToken = crypto.randomBytes(32).toString("hex");
		user.verificationToken = crypto
			.createHash("sha256")
			.update(verificationToken)
			.digest("hex");
		user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
		await user.save({ validateBeforeSave: false });

		// TODO: Send verification email

		// Generate auth token - Fix method name here
		const token = user.generateAuthToken();

		// Update last login time
		user.lastLogin = Date.now();
		await user.save({ validateBeforeSave: false });

		// Remove password from response
		user.password = undefined;

		// Send token as cookie
		sendTokenResponse(user, 201, res);
	} catch (error) {
		logger.error("Error in user registration:", error);
		next(error);
	}
};

/**
 * Log in user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		// Validate email and password
		if (!email || !password) {
			return next(new ApiError(400, "Please provide email and password"));
		}

		// Check for user with password
		const user = await User.findOne({ email }).select("+password");
		if (!user || !(await user.comparePassword(password))) {
			return next(new ApiError(401, "Invalid credentials"));
		}

		// Check if user is active
		if (!user.isActive) {
			return next(
				new ApiError(
					401,
					"Your account has been deactivated. Please contact support."
				)
			);
		}

		// Update last login time
		user.lastLogin = Date.now();
		await user.save({ validateBeforeSave: false });

		// Remove password from response
		user.password = undefined;

		// Send token as cookie
		sendTokenResponse(user, 200, res);
	} catch (error) {
		logger.error("Error in user login:", error);
		next(error);
	}
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
	// User is already available in req due to protect middleware
	res.status(200).json({
		success: true,
		data: req.user,
	});
};

/**
 * Log out user / clear cookie
 * @route GET /api/auth/logout
 * @access Private
 */
const logout = (req, res) => {
	// Clear the cookie
	res.cookie("jwt", "none", {
		expires: new Date(Date.now() + 10 * 1000), // 10 seconds
		httpOnly: true,
	});

	// If we have the user from the request, add their token to invalidated list
	if (req.user && req.user._id) {
		// Add user's token to blacklist in user record
		User.findByIdAndUpdate(
			req.user._id,
			{
				$set: {
					tokenInvalidatedAt: new Date(),
				},
			},
			{ new: true }
		).catch((err) => {
			logger.error("Error invalidating user token:", err);
		});
	}

	res.status(200).json({
		success: true,
		message: "User logged out successfully",
	});
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return next(new ApiError(404, "No user found with that email"));
		}

		// Generate reset token
		const resetToken = user.generatePasswordResetToken();
		await user.save({ validateBeforeSave: false });

		// Create reset URL
		const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

		// TODO: Send email with reset URL

		res.status(200).json({
			success: true,
			message: "Password reset email sent",
		});
	} catch (error) {
		logger.error("Error in forgot password:", error);

		// If error occurs, reset these fields
		if (req.user) {
			req.user.resetPasswordToken = undefined;
			req.user.resetPasswordExpiry = undefined;
			await req.user.save({ validateBeforeSave: false });
		}

		next(
			new ApiError(
				500,
				"Could not send reset email. Please try again later."
			)
		);
	}
};

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:resetToken
 * @access Public
 */
const resetPassword = async (req, res, next) => {
	try {
		// Get token from params and hash it
		const resetToken = req.params.resetToken;
		const resetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Find user with matching token and valid expiry
		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpiry: { $gt: Date.now() },
		});

		if (!user) {
			return next(new ApiError(400, "Invalid or expired token"));
		}

		// Set new password and clear reset fields
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiry = undefined;
		await user.save();

		// Update last login time
		user.lastLogin = Date.now();
		await user.save({ validateBeforeSave: false });

		// Send token as cookie
		sendTokenResponse(user, 200, res);
	} catch (error) {
		logger.error("Error in reset password:", error);
		next(error);
	}
};

/**
 * Update password
 * @route PUT /api/auth/update-password
 * @access Private
 */
const updatePassword = async (req, res, next) => {
	try {
		// Get user with password field
		const user = await User.findById(req.user.id).select("+password");

		// Check current password using the correct method name
		if (!(await user.comparePassword(req.body.currentPassword))) {
			return next(new ApiError(401, "Current password is incorrect"));
		}

		// Update password
		user.password = req.body.password;
		await user.save();

		// Send new token
		sendTokenResponse(user, 200, res);
	} catch (error) {
		logger.error("Error in update password:", error);
		next(error);
	}
};

/**
 * Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
const verifyEmail = async (req, res, next) => {
	try {
		// Get token from params and hash it
		const token = req.params.token;
		const verificationToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// Find user with matching token and valid expiry
		const user = await User.findOne({
			verificationToken,
			verificationTokenExpiry: { $gt: Date.now() },
		});

		if (!user) {
			return next(new ApiError(400, "Invalid or expired token"));
		}

		// Set user as verified and clear verification fields
		user.isEmailVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiry = undefined;
		await user.save({ validateBeforeSave: false });

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
		});
	} catch (error) {
		logger.error("Error in email verification:", error);
		next(error);
	}
};

/**
 * Send token response
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Response object
 */
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.generateAuthToken();

	// Calculate proper expiration date (convert days to milliseconds)
	// Add a default value in case JWT_COOKIE_EXPIRE is not set
	const cookieExpireDays = process.env.JWT_COOKIE_EXPIRE || 30; // Default to 30 days if not set
	const options = {
		expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	// Create a cleaned user object for response - ensure we don't send sensitive data
	const userData = {
		id: user._id,
		name: user.name,
		email: user.email,
		role: user.role,
		department: user.department,
		companyName: user.companyName,
		companySize: user.companySize,
		industry: user.industry,
		isActive: user.isActive,
		isEmailVerified: user.isEmailVerified,
		lastLogin: user.lastLogin,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		profileImage: user.profileImage,
	};

	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
		data: userData,
	});
};

module.exports = {
	register,
	login,
	getCurrentUser,
	logout,
	forgotPassword,
	resetPassword,
	updatePassword,
	verifyEmail,
};
