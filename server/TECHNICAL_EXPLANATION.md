# Client Feedback Management Portal - Technical Explanation

This document provides a detailed explanation of how the backend server works for the Client Feedback Management Portal, breaking down each component and how they interact with each other.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Server Architecture](#server-architecture)
3. [Database Models](#database-models)
4. [Authentication System](#authentication-system)
5. [API Endpoints](#api-endpoints)
6. [Middleware Components](#middleware-components)
7. [Controllers](#controllers)
8. [Utilities](#utilities)
9. [File Storage](#file-storage)
10. [Security Features](#security-features)
11. [Workflow Examples](#workflow-examples)

## Project Overview

The Client Feedback Management Portal is a web application that allows clients to submit feedback and administrators to manage, track, and respond to this feedback. The system provides features like:

- User authentication (login/registration)
- Feedback submission with file attachments
- Categorization of feedback
- Status and priority tracking
- Administrative dashboard for feedback management
- Analytics and reporting
- Data export functionality

## Server Architecture

The backend is built using a modern Node.js architecture with Express.js as the web framework and MongoDB as the database.

### Core Files

- **server.js**: The main entry point of the application. It sets up the Express app, connects middleware, registers routes, and starts the server.

- **config/database.js**: Handles the connection to MongoDB database.

- **config/logger.js**: Sets up the logging system using Winston to keep track of server activities and errors.

### How the Server Starts

1. When you run `npm start` or `npm run dev`:
   - The application loads environment variables from `.env`
   - Connects to the MongoDB database
   - Sets up security middleware (CORS, Helmet, etc.)
   - Registers API routes
   - Starts listening on the configured port

## Database Models

The system uses MongoDB with Mongoose for data modeling. Here are the main models:

### User Model (`user.model.js`)

This model stores user information and handles authentication.

**Key fields:**
- `name`: User's full name
- `email`: User's email (used for login)
- `password`: Hashed password (never stored in plain text)
- `role`: Either 'admin' or 'client'
- `companyName`: For client users
- `isActive`: Whether the account is active

**Special features:**
- Password hashing: Automatically converts passwords to secure hashes
- JWT token generation: Creates authentication tokens for logged-in users
- Password reset capabilities: Generates and validates reset tokens

### Feedback Model (`feedback.model.js`)

This model stores all feedback submitted by clients.

**Key fields:**
- `title`: Brief description of the feedback
- `description`: Detailed feedback content
- `category`: Reference to a feedback category
- `priority`: Importance level (low, medium, high, critical)
- `status`: Current state (new, in-progress, resolved, closed, reopened)
- `submittedBy`: User who submitted the feedback
- `assignedTo`: Admin user handling the feedback
- `attachments`: Files uploaded with the feedback
- `comments`: Discussions between users about the feedback
- `history`: Chronological record of all changes to the feedback

**Special features:**
- Automatic tracking of status changes
- Recording who made each change and when
- Response time calculation
- Resolution time tracking

### Category Model (`category.model.js`)

This model organizes feedback into different types.

**Key fields:**
- `name`: Category name
- `description`: Details about the category
- `isActive`: Whether the category is currently available for selection
- `createdBy`: Admin who created the category

### Export Log Model (`export-log.model.js`)

This model tracks data exports from the system.

**Key properties:**
- `exportType`: Format of the export (`excel` or `csv`)
- `generatedBy`: User who created the export
- `fileName`: Name of the exported file
- `filePath`: Server path where the export file is stored
- `downloadCount`: How many times the export has been downloaded
- `status`: Status of the export process (`processing`, `completed`, `failed`)

The schema includes timestamps to track when exports were created and updated.

## Authentication System

The authentication system is JWT-based (JSON Web Tokens) and manages user sessions.

### How Authentication Works

1. **Registration Process**:
   - User submits registration form with name, email, password
   - System checks if email already exists
   - Password is hashed using bcrypt
   - User record is created in database
   - JWT token is generated and returned to the user

2. **Login Process**:
   - User submits email and password
   - System verifies email exists
   - System compares password hash
   - If valid, JWT token is generated and returned

3. **Protected Routes**:
   - When accessing protected endpoints, client sends JWT token in Authorization header
   - `auth.middleware.js` verifies the token
   - If valid, the request proceeds; if invalid, access is denied

4. **Role-Based Access**:
   - Different routes require different user roles (admin/client)
   - The `restrictTo` middleware checks if user has required permissions

## API Endpoints

The server exposes these main groups of endpoints:

### Authentication Routes (`/api/auth`)

- **POST /register**: Create new user account
- **POST /login**: Authenticate and get token
- **GET /me**: Get current user's profile
- **GET /logout**: End the current session
- **POST /forgot-password**: Request password reset
- **PUT /reset-password/:token**: Reset password with token
- **PUT /update-password**: Change password (when logged in)

### Feedback Routes (`/api/feedback`)

- **GET /**: Get all feedback (with filtering)
- **GET /:id**: Get specific feedback details
- **POST /**: Submit new feedback
- **PUT /:id**: Update existing feedback
- **DELETE /:id**: Remove feedback (admin only)
- **PATCH /:id/assign**: Assign feedback to admin
- **PATCH /:id/status**: Change feedback status
- **POST /:id/comments**: Add comment to feedback
- **GET /:id/history**: View feedback change history

### Category Routes (`/api/categories`)

- **GET /**: Get all categories
- **POST /**: Create new category (admin only)
- **PUT /:id**: Update category (admin only)
- **DELETE /:id**: Remove category (admin only)
- **PATCH /:id/toggle-status**: Enable/disable category

### Export Routes (`/api/exports`)

- **POST /feedback**: Generate export of feedback data in Excel or CSV format
- **POST /analytics**: Generate export of analytics data in Excel or CSV format
- **GET /history**: View previous exports
- **GET /download/:id**: Download exported file

All export routes use authentication middleware to ensure only authenticated users can access them.

## Middleware Components

Middleware functions process requests before they reach the route handlers.

### Key Middleware Functions

- **error.middleware.js**: Catches and formats all errors
- **auth.middleware.js**: Verifies JWT tokens and user permissions
- **validation.middleware.js**: Validates and sanitizes input data

### Request Flow Through Middleware

1. Request arrives at server
2. Global middleware processes it (CORS, security headers, etc.)
3. Route-specific middleware applies (authentication, validation)
4. Controller handles the request
5. Response passes through error handling middleware
6. Response sent to client

## Controllers

Controllers contain the business logic that processes requests after middleware validation.

### Auth Controller (`auth.controller.js`)

Handles user registration, login, and password management.

**Key functions:**
- `register`: Creates new user accounts
- `login`: Authenticates users
- `forgotPassword`: Initiates password reset process
- `resetPassword`: Processes reset tokens

### Export Controller (`export.controller.js`)

Handles data export functionality.

**Key functions:**
- `exportFeedback`: Generates Excel or CSV exports of feedback data
- `exportAnalytics`: Generates Excel or CSV exports of analytics data
- `getExportHistory`: Retrieves past exports
- `downloadExport`: Serves exported files to users

The controller handles validation of export format selection and filtering options.

## Utilities

### Export Utilities (`export.utils.js`)

Classes for generating export formats.

The `ExportUtility` class handles:
- Managing export processes
- Tracking export status
- Efficiently generating Excel and CSV files
- Memory-efficient processing using streams and buffers
- Proper error handling

The utility supports both Excel and CSV formats with optimized approaches for each format.

## File Storage

The system stores various files uploaded by users.

### Storage Organization

- **Upload directories:**
  - Feedback attachments: `uploads/feedback/`
  - Export files: `uploads/exports/`

### File Handling

1. **Files are processed using multer middleware:**
   - File size limits enforced
   - File types validated
   - Unique filenames generated

2. **Export files:**
   - Excel spreadsheets for data exports
   - Tracked in the export log database

## Security Features

The portal implements multiple layers of security:

1. **Authentication security:**
   - Password hashing with bcrypt
   - JWT with expiration
   - HTTPOnly cookies for token storage

2. **Data validation:**
   - Input sanitization to prevent injection
   - Validation schemas for all requests

3. **Protected routes:**
   - Role-based access control
   - User verification on sensitive operations

4. **File security:**
   - File type validation
   - Size restrictions
   - Secure naming convention

5. **HTTP security headers:**
   - CORS configuration
   - XSS protection
   - Content Security Policy

## Workflow Examples

### Example 1: Client Submits Feedback

1. Client logs in via `/api/auth/login`
2. Client creates feedback via `/api/feedback`
3. System stores feedback and attachments
4. Admin gets notified of new feedback
5. Admin assigns feedback to team member
6. Team member updates status as they work on it
7. Client can track progress through the portal

### Example 2: Export and Analysis

1. Admin logs in via `/api/auth/login`
2. Admin filters feedback by date, status
3. Admin exports data to Excel via `/api/exports/feedback`
4. System processes export asynchronously
5. Admin downloads completed export
6. Admin analyzes trends and response times
