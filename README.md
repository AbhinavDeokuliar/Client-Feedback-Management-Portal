# Client Feedback Management Portal 📝

> A comprehensive full-stack application for managing client feedback, streamlining communication between clients and service providers.

## ✨ Features

-  **User Authentication** - Secure JWT-based authentication system with role management
-  **Feedback Submission** - Intuitive interface for clients to submit feedback with attachments
-  **Comment System** - Real-time commenting on feedback items
-  **Dashboard Analytics** - Comprehensive analytics and reporting capabilities
-  **Status Tracking** - Real-time tracking of feedback status and priority
-  **Responsive Design** - Works seamlessly on desktop and mobile devices

## 📸 Screenshots

### Dashboard Overview

<p align="center">
  <img src="/Screenshots/2.png" alt="Dashboard Screenshot" width="800">
  <br>
  <em>Admin dashboard showing feedback analytics and recent submissions</em>
</p>

### Feedback Submission

<p align="center">
  <img src="/Screenshots/image.png" alt="Feedback Form Screenshot" width="800">
  <br>
  <em>Client interface for submitting new feedback</em>
</p>

### Analytics & Reporting

<p align="center">
  <img src="/Screenshots/image1.png" alt="Analytics Screenshot" width="800">
  <br>
  <em>Advanced analytics and reporting features</em>
</p>

## 🛠️ Tech Stack

### Frontend

-  React with Vite for fast development
-  Redux for state management
-  React Router for navigation
-  Material-UI for component library
-  Chart.js for data visualization
-  Axios for API requests

### Backend

-  Node.js & Express.js
-  MongoDB with Mongoose ODM
-  JWT authentication
-  bcrypt for password security
-  Winston for logging
-  Multer for file uploads

## 🚀 Installation & Setup

### Prerequisites

-  Node.js (v14+)
-  MongoDB (local or Atlas)
-  npm or yarn

### Clone Repository

```bash
git clone <repository-url>
cd client-feedback-management-portal
```

### Backend Setup

```bash
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Create necessary directories
mkdir -p uploads/feedback uploads/exports logs

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd client
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start development server
npm run dev
```

## 📚 Documentation

### API Documentation

Comprehensive API documentation is available at `/api-docs` when running the server or in the [server README](./server/README.md).

### User Guide

For detailed usage instructions, please refer to the [User Guide](docs/user-guide.md).

## 🔒 Security Features

-  JWT authentication
-  Password hashing with bcrypt
-  CSRF protection
-  Rate limiting
-  Secure HTTP headers
-  Input validation and sanitization
-  XSS protection

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
