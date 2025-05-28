# Client Feedback Management Portal - API Documentation

This document provides comprehensive details about all APIs in the Client Feedback Management Portal system, including authentication requirements, request/response formats, and testing guidance.

## Base URL

When running locally, the base URL is:
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). 

### How to authenticate:

1. **Via Authorization Header (preferred method):**
   ```
   Authorization: Bearer your_jwt_token
   ```

2. **Via Cookie:**
   The API automatically sets a cookie named `jwt` when you login.

### Token Expiry:
Tokens expire after 7 days by default (configurable in .env).

## API Endpoints

## 1. Authentication APIs

### Register User
- **URL:** `/auth/register`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Register a new user
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "role": "client", // Optional, defaults to "client". Other options: "admin", "manager", "support", "developer", "qa"
    "department": "n/a", // Optional, defaults to "n/a". Other options: "management", "customer_support", "development", "quality_assurance", "product_management"
    "companyName": "ABC Corp", // Optional
    "companySize": "11-50", // Optional
    "industry": "Technology" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "department": "n/a",
      "companyName": "ABC Corp",
      "companySize": "11-50",
      "industry": "Technology",
      "isActive": true,
      "isEmailVerified": false,
      "lastLogin": "2025-05-23T10:30:00.000Z",
      "createdAt": "2025-05-23T10:30:00.000Z",
      "updatedAt": "2025-05-23T10:30:00.000Z"
    }
  }
  ```
- **Notes:** 
  - Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
  - Only existing admins can create new admin accounts
  - For internal team members, specify both role and department

### Login
- **URL:** `/auth/login`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Authenticate user and get token
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      // ... other user data
    }
  }
  ```

### Get Current User
- **URL:** `/auth/me`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get profile of logged-in user
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      // ... other user data
    }
  }
  ```

### Logout
- **URL:** `/auth/logout`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Logout user (clears cookie)
- **Response:**
  ```json
  {
    "success": true,
    "message": "User logged out successfully"
  }
  ```

### Forgot Password
- **URL:** `/auth/forgot-password`
- **Method:** `POST`
- **Authentication:** Not required
- **Description:** Request password reset email
- **Request Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### Reset Password
- **URL:** `/auth/reset-password/:resetToken`
- **Method:** `PUT`
- **Authentication:** Not required
- **Description:** Reset password using token from email
- **Request Body:**
  ```json
  {
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "new_jwt_token",
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      // ... other user data
    }
  }
  ```

### Update Password
- **URL:** `/auth/update-password`
- **Method:** `PUT`
- **Authentication:** Required
- **Description:** Update password when logged in
- **Request Body:**
  ```json
  {
    "currentPassword": "Password123!",
    "password": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "new_jwt_token",
    "data": {
      "id": "user_id",
      "name": "John Doe",
      // ... other user data
    }
  }
  ```

### Verify Email
- **URL:** `/auth/verify-email/:token`
- **Method:** `GET`
- **Authentication:** Not required
- **Description:** Verify user email address
- **Response:**
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

## 2. User Management APIs

### Get All Users
- **URL:** `/users`
- **Method:** `GET`
- **Authentication:** Required (Admin only)
- **Description:** Get all users with pagination
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "total": 15,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 2
    },
    "data": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "client",
        "department": "n/a",
        "companyName": "ABC Corp",
        "companySize": "11-50",
        "industry": "Technology",
        "isActive": true,
        "isEmailVerified": true,
        "lastLogin": "2025-05-23T10:30:00.000Z",
        "createdAt": "2025-05-23T10:30:00.000Z",
        "updatedAt": "2025-05-23T10:30:00.000Z"
      },
      {
        "id": "user_id_2",
        "name": "Jane Developer",
        "email": "jane.dev@example.com",
        "role": "developer",
        "department": "development",
        // ... other user data
      }
      // ... more users
    ]
  }
  ```
- **Notes:** Only accessible by users with admin role

### Get Team Members
- **URL:** `/users/team`
- **Method:** `GET` 
- **Authentication:** Required (Admin or Manager only)
- **Description:** Get all internal team members (non-client users) for task assignment
- **Response:**
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "id": "user_id",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin",
        "department": "management",
        "profileImage": "default-avatar.png"
      },
      {
        "id": "user_id_2",
        "name": "Jane Developer",
        "email": "jane.dev@example.com",
        "role": "developer",
        "department": "development",
        "profileImage": "default-avatar.png"
      },
      // ... more team members
    ]
  }
  ```
- **Notes:** 
  - Only active users are returned
  - Only accessible by admin and manager roles
  - Designed specifically for assigning feedback to team members

### Get Current User
- **URL:** `/users/me`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get profile of logged-in user
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      // ... other user data
    }
  }
  ```

## 3. Feedback APIs

### Get All Feedback
- **URL:** `/feedback`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get all feedback with pagination and filtering
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort field (e.g., `-createdAt` for newest first)
  - `status`: Filter by status (`new`, `in-progress`, `resolved`, `closed`, `reopened`)
  - `priority`: Filter by priority (`low`, `medium`, `high`, `critical`)
  - `category`: Filter by category ID
  - Advanced queries supported (e.g., `createdAt[gte]=2025-05-01`)
- **Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "total": 25,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 3
    },
    "data": [
      {
        "id": "feedback_id",
        "title": "Issue with login screen",
        "description": "The login screen freezes when...",
        "status": "in-progress",
        "priority": "high",
        "category": {
          "id": "category_id",
          "name": "Bug Report"
        },
        "submittedBy": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedTo": {
          "id": "admin_id",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2025-05-20T14:30:00.000Z",
        "updatedAt": "2025-05-21T09:15:00.000Z"
      },
      // ... more feedback items
    ]
  }
  ```
- **Notes:** Clients can only see their own feedback, admins can see all feedback

### Get Feedback by ID
- **URL:** `/feedback/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get detailed information about specific feedback
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "title": "Issue with login screen",
      "description": "The login screen freezes when...",
      "status": "in-progress",
      "priority": "high",
      "category": {
        "id": "category_id",
        "name": "Bug Report"
      },
      "submittedBy": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": {
        "id": "admin_id",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "attachments": [
        {
          "filename": "attachment-123456.png",
          "originalname": "screenshot.png",
          "mimetype": "image/png",
          "size": 45678
        }
      ],
      "comments": [
        {
          "id": "comment_id",
          "text": "We're looking into this issue",
          "postedBy": {
            "id": "admin_id",
            "name": "Admin User",
            "email": "admin@example.com"
          },
          "createdAt": "2025-05-21T09:15:00.000Z"
        }
      ],
      "createdAt": "2025-05-20T14:30:00.000Z",
      "updatedAt": "2025-05-21T09:15:00.000Z"
    }
  }
  ```

### Create Feedback
- **URL:** `/feedback`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Submit new feedback
- **Content Type:** `multipart/form-data` (for file uploads)
- **Request Body:**
  ```
  title: "Issue with login screen"
  description: "The login screen freezes when attempting to log in with..."
  categoryId: "category_id"
  priority: "high"
  attachments: [file1, file2, ...] (optional)
  tags: ["ui", "login"] (optional)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "title": "Issue with login screen",
      "description": "The login screen freezes when...",
      "status": "new",
      "priority": "high",
      "category": "category_id",
      "submittedBy": "user_id",
      "attachments": [
        {
          "filename": "attachment-123456.png",
          "originalname": "screenshot.png",
          "path": "uploads/feedback/attachment-123456.png",
          "mimetype": "image/png",
          "size": 45678,
          "uploadedAt": "2025-05-23T10:30:00.000Z"
        }
      ],
      "createdAt": "2025-05-23T10:30:00.000Z",
      "updatedAt": "2025-05-23T10:30:00.000Z"
    }
  }
  ```
- **Notes:** Supports up to 5 file attachments, max 10MB each

### Update Feedback
- **URL:** `/feedback/:id`
- **Method:** `PUT`
- **Authentication:** Required
- **Description:** Update existing feedback
- **Content Type:** `multipart/form-data` (for file uploads)
- **Request Body:**
  ```
  title: "Updated issue title"
  description: "Updated description..."
  category: "category_id"
  priority: "medium"
  status: "in-progress"
  attachments: [file1, file2, ...] (optional)
  tags: ["ui", "login", "updated"] (optional)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "title": "Updated issue title",
      "description": "Updated description...",
      "status": "in-progress",
      "priority": "medium",
      // ... other updated fields
    }
  }
  ```
- **Notes:** Clients can only update their own feedback

### Delete Feedback
- **URL:** `/feedback/:id`
- **Method:** `DELETE`
- **Authentication:** Required (Admin only)
- **Description:** Permanently delete feedback
- **Response:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

### Assign Feedback
- **URL:** `/feedback/:id/assign`
- **Method:** `PATCH`
- **Authentication:** Required (Admin only)
- **Description:** Assign feedback to specific user
- **Request Body:**
  ```json
  {
    "assignToUserId": "user_id"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "assignedTo": "user_id",
      // ... other feedback data
    }
  }
  ```

### Change Feedback Status
- **URL:** `/feedback/:id/status`
- **Method:** `PATCH`
- **Authentication:** Required
- **Description:** Update feedback status
- **Request Body:**
  ```json
  {
    "status": "resolved"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "status": "resolved",
      "resolvedAt": "2025-05-23T11:45:00.000Z",
      // ... other feedback data
    }
  }
  ```
- **Notes:** 
  - Admins can change to any status
  - Clients can only change to `closed` or `reopened`

### Add Comment
- **URL:** `/feedback/:id/comments`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Add comment to feedback
- **Content Type:** `multipart/form-data` (for file uploads)
- **Request Body:**
  ```
  text: "This is my comment on the feedback"
  attachments: [file1, file2, ...] (optional)
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "comments": [
        // ... existing comments
        {
          "text": "This is my comment on the feedback",
          "postedBy": "user_id",
          "attachments": [
            {
              "filename": "attachment-123456.pdf",
              "originalname": "document.pdf",
              "mimetype": "application/pdf",
              "size": 98765
            }
          ],
          "createdAt": "2025-05-23T14:20:00.000Z"
        }
      ],
      // ... other feedback data
    }
  }
  ```
- **Notes:** Supports up to 3 file attachments per comment

### Get Feedback Comments
- **URL:** `/feedback/:id/comments`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get all comments for a feedback
- **Response:**
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "text": "Initial assessment comment",
        "postedBy": {
          "id": "admin_id",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "attachments": [],
        "createdAt": "2025-05-21T09:15:00.000Z"
      },
      // ... more comments
    ]
  }
  ```

### Add Attachments
- **URL:** `/feedback/:id/attachments`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Add additional attachments to feedback
- **Content Type:** `multipart/form-data`
- **Request Body:**
  ```
  attachments: [file1, file2, ...]
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback_id",
      "attachments": [
        // ... existing attachments
        {
          "filename": "attachment-456789.jpg",
          "originalname": "additional-image.jpg",
          "path": "uploads/feedback/attachment-456789.jpg",
          "mimetype": "image/jpeg",
          "size": 78901,
          "uploadedAt": "2025-05-23T15:30:00.000Z"
        }
      ],
      // ... other feedback data
    }
  }
  ```

### Get Feedback History
- **URL:** `/feedback/:id/history`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get change history of feedback
- **Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "action": "created",
        "performedBy": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "timestamp": "2025-05-20T14:30:00.000Z"
      },
      {
        "action": "status-changed",
        "field": "status",
        "oldValue": "new",
        "newValue": "in-progress",
        "performedBy": {
          "id": "admin_id",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "timestamp": "2025-05-21T09:10:00.000Z"
      },
      // ... more history entries
    ]
  }
  ```

### Get Feedback Statistics
- **URL:** `/feedback/statistics/overview`
- **Method:** `GET`
- **Authentication:** Required (Admin only)
- **Description:** Get feedback analytics and statistics
- **Query Parameters:**
  - `startDate`: Filter by start date (YYYY-MM-DD)
  - `endDate`: Filter by end date (YYYY-MM-DD)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "overview": {
        "total": 45,
        "statusDistribution": {
          "new": 12,
          "inProgress": 15,
          "resolved": 10,
          "closed": 5,
          "reopened": 3
        },
        "priorityDistribution": {
          "low": 8,
          "medium": 20,
          "high": 12,
          "critical": 5
        },
        "averageResponseTime": 43200000, // in milliseconds (12 hours)
        "averageResolutionTime": 259200000 // in milliseconds (3 days)
      },
      "categoryDistribution": [
        { "name": "Bug Report", "count": 20 },
        { "name": "Feature Request", "count": 15 },
        { "name": "Question", "count": 10 }
      ],
      "timeTrend": [
        { "date": "2025-05-01", "count": 3 },
        { "date": "2025-05-02", "count": 5 },
        // ... more dates
      ],
      "responsePerformance": [
        {
          "priority": "critical",
          "avgResponseTime": 14400000, // 4 hours
          "minResponseTime": 3600000,  // 1 hour
          "maxResponseTime": 28800000  // 8 hours
        },
        // ... other priorities
      ]
    }
  }
  ```

## 4. Category APIs

### Get All Categories
- **URL:** `/categories`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get all feedback categories
- **Query Parameters:**
  - `active`: Filter by active status (true/false)
- **Response:**
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": "category_id_1",
        "name": "Bug Report",
        "description": "Issues with existing functionality",
        "isActive": true,
        "createdBy": {
          "id": "admin_id",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2025-04-15T10:00:00.000Z",
        "updatedAt": "2025-04-15T10:00:00.000Z"
      },
      // ... more categories
    ]
  }
  ```

### Get Category by ID
- **URL:** `/categories/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get detailed information about specific category
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "category_id",
      "name": "Bug Report",
      "description": "Issues with existing functionality",
      "isActive": true,
      "createdBy": {
        "id": "admin_id",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "feedbackCount": 20,
      "createdAt": "2025-04-15T10:00:00.000Z",
      "updatedAt": "2025-04-15T10:00:00.000Z"
    }
  }
  ```

### Create Category
- **URL:** `/categories`
- **Method:** `POST`
- **Authentication:** Required (Admin only)
- **Description:** Create new feedback category
- **Request Body:**
  ```json
  {
    "name": "Feature Request",
    "description": "Suggestions for new features",
    "isActive": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "category_id",
      "name": "Feature Request",
      "description": "Suggestions for new features",
      "isActive": true,
      "createdBy": "admin_id",
      "createdAt": "2025-05-23T16:45:00.000Z",
      "updatedAt": "2025-05-23T16:45:00.000Z"
    }
  }
  ```

### Update Category
- **URL:** `/categories/:id`
- **Method:** `PUT`
- **Authentication:** Required (Admin only)
- **Description:** Update existing category
- **Request Body:**
  ```json
  {
    "name": "Updated Feature Requests",
    "description": "Updated description for feature requests",
    "isActive": true
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "category_id",
      "name": "Updated Feature Requests",
      "description": "Updated description for feature requests",
      "isActive": true,
      "createdBy": "admin_id",
      "createdAt": "2025-04-15T10:00:00.000Z",
      "updatedAt": "2025-05-23T17:00:00.000Z"
    }
  }
  ```

### Delete Category
- **URL:** `/categories/:id`
- **Method:** `DELETE`
- **Authentication:** Required (Admin only)
- **Description:** Delete category
- **Response:**
  ```json
  {
    "success": true,
    "data": {}
  }
  ```
- **Notes:** Cannot delete categories that have associated feedback items

### Toggle Category Status
- **URL:** `/categories/:id/toggle-status`
- **Method:** `PATCH`
- **Authentication:** Required (Admin only)
- **Description:** Toggle category active status
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "category_id",
      "name": "Feature Request",
      "isActive": false, // Was toggled from true to false
      "createdBy": "admin_id",
      "createdAt": "2025-04-15T10:00:00.000Z",
      "updatedAt": "2025-05-23T17:15:00.000Z"
    }
  }
  ```

## 4. Export APIs

### Export Feedback Data
- **URL:** `/exports/feedback`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Generate export of feedback data in Excel or CSV format
- **Request Body:**
  ```json
  {
    "format": "xlsx", // Optional, defaults to "xlsx". Options: "xlsx", "csv"
    "startDate": "2025-05-01",
    "endDate": "2025-05-31",
    "status": "resolved",
    "priority": "high",
    "category": ["category_id_1", "category_id_2"]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Export completed successfully",
    "data": {
      "exportId": "export_log_id",
      "fileName": "feedback_data_20250523_123456.xlsx",
      "recordCount": 15,
      "format": "xlsx",
      "downloadUrl": "/api/exports/download/export_log_id"
    }
  }
  ```
- **Notes:** All filtering parameters are optional

### Export Analytics Data
- **URL:** `/exports/analytics`
- **Method:** `POST`
- **Authentication:** Required
- **Description:** Generate export of feedback analytics in Excel or CSV format
- **Request Body:**
  ```json
  {
    "format": "csv", // Optional, defaults to "xlsx". Options: "xlsx", "csv"
    "startDate": "2025-05-01",
    "endDate": "2025-05-31"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Analytics export completed successfully",
    "data": {
      "exportId": "export_log_id",
      "fileName": "analytics_report_20250523_123456.csv",
      "format": "csv",
      "downloadUrl": "/api/exports/download/export_log_id"
    }
  }
  ```

### Get Export History
- **URL:** `/exports/history`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Get history of exports
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status (`processing`, `completed`, `failed`)
- **Response:**
  ```json
  {
    "success": true,
    "count": 5,
    "total": 12,
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 2
    },
    "data": [
      {
        "id": "export_log_id",
        "exportType": "excel",
        "fileName": "feedback_data_20250523_123456.xlsx",
        "status": "completed",
        "generatedBy": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "fileSize": 245678,
        "recordCount": 15,
        "downloadCount": 2,
        "lastDownloadedAt": "2025-05-23T18:30:00.000Z",
        "createdAt": "2025-05-23T17:45:00.000Z",
        "completedAt": "2025-05-23T17:46:00.000Z"
      },
      // ... more export logs
    ]
  }
  ```

### Download Export
- **URL:** `/exports/download/:id`
- **Method:** `GET`
- **Authentication:** Required
- **Description:** Download exported file
- **Response:** File download (binary)
- **Notes:** 
  - Response content type depends on file type (Excel)
  - Users can only download their own exports (admin can download any)

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": [
    {
      "field": "email",
      "message": "Must provide a valid email address"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Resource created
- `400`: Bad request (validation error)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `500`: Server error

## Testing with Postman

1. **Set up environment variables in Postman:**
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: empty initially (will be populated after login)

2. **Create a login request to get token:**
   - Use the login endpoint to obtain a JWT token
   - Set an environment script to capture the token:
   ```js
   // In the Tests tab of the login request
   const response = pm.response.json();
   if (response.token) {
     pm.environment.set("token", response.token);
   }
   ```

3. **Set up a collection authorization:**
   - Type: Bearer Token
   - Token: `{{token}}`

4. **For file uploads:**
   - Use form-data in the request body
   - Set the key type to "File" for file fields

## Example Testing Workflow

1. Register an admin user
2. Login as admin
3. Create categories
4. Register a client user
5. Login as client
6. Submit feedback with attachments
7. Add comments
8. As admin, assign and change status
9. Test various filtering options
10. Test export functionality

## Notes on Database IDs

When working with MongoDB and Mongoose, object IDs are 24-character hexadecimal strings. In the request/response examples, ID placeholders like `user_id` or `feedback_id` represent these MongoDB ObjectId values.
