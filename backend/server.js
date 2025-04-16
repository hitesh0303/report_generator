require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');

const app = express();

// Configure CORS for production and development
const corsOptions = {
  origin: '*', // Temporarily allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

// Increase JSON payload limits
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch(e) {
      res.status(400).json({ message: 'Invalid JSON payload', error: e.message });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log when request completes/errors
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  res.on('error', (error) => {
    const duration = Date.now() - start;
    console.error(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - Error: ${error.message}`);
  });
  
  next();
});

// ✅ Check Cloudinary Configuration
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: "****" // Hide secret in logs
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection with improved error handling
mongoose.connect(process.env.MONGODB_URI, { 
  serverSelectionTimeoutMS: 5000 // 5 seconds
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
  
  // Check for specific error types
  if (err.name === 'MongoServerSelectionError') {
    console.error('MongoDB server selection error. Is MongoDB running?');
  }
  
  // Exit if we can't connect to the database
  process.exit(1);
});

// ✅ Correct Multer Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "report_images",
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

// Routes
app.use('/api', authRoutes);
app.use('/api', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload', error: err.message });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request entity too large', error: err.message });
  }
  
  res.status(500).json({ 
    message: 'Internal server error', 
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// ✅ Catch-all Route for Undefined Endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
