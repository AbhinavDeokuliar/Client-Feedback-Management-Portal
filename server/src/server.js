const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const categoryRoutes = require("./routes/category.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const exportRoutes = require("./routes/export.routes");

// Import middleware
const { errorHandler } = require("./middleware/error.middleware");

// Create Express app
const app = express();

// Database connection
require("./config/database");

// Security middleware
app.use(helmet());
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? "https://your-production-domain.com"
				: "http://localhost:5174",
		credentials: true,
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes by default
	max: process.env.RATE_LIMIT_MAX, // 100 requests per window by default
	standardHeaders: true,
	legacyHeaders: false,
	message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all requests
app.use(limiter);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Response compression
app.use(compression());

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/exports", exportRoutes);

// API health check
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
	console.error("UNHANDLED REJECTION:", err);
	// Close server & exit process
	// server.close(() => process.exit(1));
});

module.exports = app;
