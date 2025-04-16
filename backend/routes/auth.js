const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        success: false 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format',
        success: false 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists',
        success: false 
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long',
        success: false 
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      email: email.toLowerCase(), 
      password: hashedPassword 
    });
    
    await user.save();

    // Generate token for immediate login
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Send success response with token
    res.status(201).json({ 
      message: 'User registered successfully',
      success: true,
      token,
      userId: user._id
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists',
        success: false 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid input data',
        success: false,
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Generic error response
    res.status(500).json({ 
      message: 'Error registering user',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        success: false 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format',
        success: false 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        success: false 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        message: 'Invalid credentials',
        success: false 
      });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' } // Increased token expiry to 24 hours
    );

    res.status(200).json({ 
      message: 'Login successful',
      success: true,
      token,
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid input data',
        success: false,
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Generic error response
    res.status(500).json({ 
      message: 'Error logging in',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
