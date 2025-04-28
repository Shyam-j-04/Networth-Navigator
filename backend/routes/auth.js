const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for registration and login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Input validation for registration
const validateRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Input validation for login
const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Apply rate limiting to registration and login
router.post('/register', authLimiter, validateRegistration, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  registerUser(req, res, next);
});

router.post('/login', authLimiter, validateLogin, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  loginUser(req, res, next);
});

module.exports = router;