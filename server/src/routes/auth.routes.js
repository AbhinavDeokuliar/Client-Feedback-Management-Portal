const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerValidation,
  loginValidation,
  passwordResetValidation,
  passwordUpdateValidation,
  validate
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', passwordResetValidation, validate, forgotPassword);
router.put('/reset-password/:resetToken', passwordUpdateValidation, validate, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes below this middleware require authentication
router.get('/me', getCurrentUser);
router.get('/logout', logout);
router.put('/update-password', passwordUpdateValidation, validate, updatePassword);

module.exports = router;

