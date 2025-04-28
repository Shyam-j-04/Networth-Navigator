const express = require('express');
const { getUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure user is authenticated
const rateLimit = require('express-rate-limit');
const User = require('../models/User');  // Ensure the correct path to your User model


const router = express.Router();

// Rate limiting for user endpoints
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

// Apply rate limiting and authentication middleware to all routes
router.use(authMiddleware);
router.use(userLimiter);

// Get User Profile (Using Controller)
router.get('/profile', getUserProfile);

// Update Profile (Example)
router.put('/profile', (req, res) => {
  // Logic to update user profile
  res.json({ message: 'Profile updated successfully' });
});

// Change Password (Example)
router.post('/change-password', (req, res) => {
  // Logic to change user password
  res.json({ message: 'Password changed successfully' });
});

// DELETE User Profile
router.delete('/delete', async (req, res) => {
  try {
    console.log('Attempting to delete user with ID:', req.user.id);  // Log the user ID to see what is being passed

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);
    console.log('User successfully deleted');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;

