# Client Feedback Management Portal - Backend

A comprehensive backend system for managing client feedback, built with Express.js and MongoDB.

## Features

- Complete user authentication system with JWT
- Role-based access control (admin/client)
- Feedback management with file attachments
- Comment system on feedback items
- Categorization of feedback
- Real-time status and priority tracking
- Detailed history logging for all changes
- Analytics and reporting capabilities
- Export functionality (Excel and CSV formats)

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Winston for logging
- Multer for file uploads
- Various security packages (helmet, rate-limiting, etc.)

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd client-feedback-management-portal/server
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feedback-portal
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
NODE_ENV=development
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

4. Create necessary directories
```bash
mkdir -p uploads/feedback uploads/exports logs
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password with token
- `PUT /api/auth/update-password` - Update password (authenticated)
- `GET /api/auth/verify-email/:token` - Verify email address

### Feedback Endpoints

- `GET /api/feedback` - Get all feedback (with pagination and filtering)
- `GET /api/feedback/:id` - Get feedback by ID
- `POST /api/feedback` - Create new feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback (admin only)
- `GET /api/feedback/status/:status` - Get feedback by status
- `GET /api/feedback/priority/:priority` - Get feedback by priority
- `GET /api/feedback/category/:categoryId` - Get feedback by category
- `PATCH /api/feedback/:id/assign` - Assign feedback to user (admin only)
- `PATCH /api/feedback/:id/status` - Change feedback status
- `POST /api/feedback/:id/comments` - Add comment to feedback
- `GET /api/feedback/:id/comments` - Get feedback comments
- `POST /api/feedback/:id/attachments` - Add attachments to feedback
- `GET /api/feedback/:id/history` - Get feedback history
- `GET /api/feedback/statistics/overview` - Get feedback statistics (admin only)

### Category Endpoints

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)
- `PATCH /api/categories/:id/toggle-status` - Toggle category status (admin only)

### Export Endpoints

- `POST /api/exports/pdf/feedback` - Export feedback as PDF
- `POST /api/exports/excel/feedback` - Export feedback as Excel
- `POST /api/exports/csv/feedback` - Export feedback as CSV
- `POST /api/exports/excel/analytics` - Export analytics as Excel
- `GET /api/exports/history` - Get export history (admin only)
- `GET /api/exports/download/:id` - Download export file

## Project Structure

```
server/
├── src/                   # Source code
│   ├── config/            # Configuration files
│   │   ├── database.js    # Database configuration
│   │   └── logger.js      # Logger configuration
│   ├── controllers/       # Route controllers
│   │   ├── auth.controller.js
│   │   ├── feedback.controller.js
│   │   └── ...
│   ├── middleware/        # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── ...
│   ├── models/            # Mongoose models
│   │   ├── user.model.js
│   │   ├── feedback.model.js
│   │   └── ...
│   ├── routes/            # API routes
│   │   ├── auth.routes.js
│   │   ├── feedback.routes.js
│   │   └── ...
│   ├── utils/             # Utility functions
│   │   └── ...
│   └── server.js          # Entry point
├── uploads/               # File uploads directory
│   ├── feedback/          # Feedback attachments
│   └── exports/           # Generated exports
├── logs/                  # Application logs
├── .env                   # Environment variables
├── package.json
└── README.md
```

## Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- CSRF protection
- Rate limiting
- Secure HTTP headers with Helmet
- Input validation and sanitization
- XSS protection

## License

[MIT License](LICENSE)

