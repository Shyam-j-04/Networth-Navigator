const bcrypt = require("bcryptjs"); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Registration attempt for email:', email); 
  console.log("🔹 Password before hashing:", password); // Debugging

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Ensure password is only hashed ONCE
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log("🔹 Hashed Password:", hashedPassword); // Debugging

    console.log("🔹 Hashed Password (Before Saving):", hashedPassword);


    // Create and save the new user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log("🔹 Hashed Password (After Saving):", hashedPassword);

    console.log('✅ User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
};



const { validationResult } = require('express-validator');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt for email:', email); // Debugging

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Debugging
      return res.status(400).json({ error: 'User not found' });
    }

    console.log('User found:', user); // Debugging

    // Debugging: Log the provided password and hashed password
    console.log('🔍 Entered Password:', password);
    console.log('🔍 Stored Hash from DB:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('✅ Password Match: ❌ Failure'); // Debugging
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password Match: ✔️ Success'); // Debugging

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message); // Debugging
    res.status(500).json({ error: err.message });
  }
};



module.exports = { registerUser, loginUser };