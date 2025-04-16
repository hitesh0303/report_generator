const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: { 
    type: String, 
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, {
  timestamps: true
});

// Add pre-save middleware to handle validation
userSchema.pre('save', function(next) {
  if (!this.email) {
    next(new Error('Email is required'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
