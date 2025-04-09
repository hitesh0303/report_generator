const express = require('express');
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;


// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reports',  // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

// Route to upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const report = new Report({
      title: req.body.title,
      date: req.body.date,
      description: req.body.description,
      imageUrl: req.file.path, // Cloudinary image URL
    });

    await report.save();
    res.json({ message: 'Report saved with image!', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post('/reports', authMiddleware, async (req, res) => {
  try {
    // Log the basic information about the request
    console.log(`Received report save request from user: ${req.userId}`);
    console.log(`Report type: ${req.body.reportType || 'not specified'}`);
    console.log(`Report title: ${req.body.title || 'not specified'}`);
    
    // Log data sizes to diagnose potential payload issues
    const dataSize = JSON.stringify(req.body).length;
    console.log(`Request data size: ${(dataSize / 1024).toFixed(2)} KB`);
    
    // Check for extremely large requests
    if (dataSize > 10 * 1024 * 1024) { // 10MB limit
      console.error(`Request exceeds reasonable size limit: ${(dataSize / 1024 / 1024).toFixed(2)}MB`);
      return res.status(413).json({ 
        message: 'Request entity too large',
        details: 'The report data exceeds the size limit of 10MB' 
      });
    }
    
    // Check if we have incoming chart images data
    const hasChartImages = req.body.chartImages && req.body.chartImages.length > 0;
    console.log(`Chart images: ${hasChartImages ? req.body.chartImages.length : 0}`);
    
    // Check if images array is present
    const hasImages = req.body.images && req.body.images.length > 0;
    console.log(`Images: ${hasImages ? req.body.images.length : 0}`);
    
    // Validate required fields
    if (!req.body.title) {
      console.error('Missing required field: title');
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Create a safer copy of the data without potential circular references
    const sanitizedData = {
      ...req.body,
      userId: req.userId
    };
    
    // Create and save the report
    try {
      console.log('Attempting to create new Report document...');
      const report = new Report(sanitizedData);
      await report.save();
      console.log(`Report saved successfully with ID: ${report._id}`);
      res.status(201).json(report);
    } catch (dbError) {
      console.error('Database error while saving report:', dbError);
      
      if (dbError.name === 'ValidationError') {
        // Handle mongoose validation errors
        const validationErrors = Object.keys(dbError.errors).map(field => ({
          field,
          message: dbError.errors[field].message
        }));
        
        res.status(400).json({
          message: 'Validation error',
          errors: validationErrors
        });
      } else if (dbError.name === 'MongoServerError' && dbError.code === 16777228) {
        // Handle document too large errors
        res.status(413).json({ 
          message: 'Document too large for MongoDB',
          details: 'Try reducing the number of images or charts'
        });
      } else {
        throw dbError; // Rethrow for general error handler
      }
    }
  } catch (error) {
    console.error('Error in /reports POST route:', error);
    console.error('Error details:', error.stack);
    
    // Send detailed error response
    res.status(500).json({ 
      message: 'Error saving report', 
      error: error.message,
      details: error.stack
    });
  }
});

router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

router.get('/reports/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`Fetching report with ID: ${req.params.id}`);
    const report = await Report.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!report) {
      console.log(`Report not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Log chart image information
    const hasChartImages = report.chartImages && report.chartImages.length > 0;
    console.log(`Retrieved report: ${report.title}, Chart images: ${hasChartImages ? report.chartImages.length : 0}`);
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ 
      message: 'Error fetching report', 
      error: error.message,
      details: error.stack
    });
  }
});

// Delete a report by ID
router.delete('/reports/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`Request to delete report with ID: ${req.params.id}`);
    
    // First check if the report exists and belongs to the current user
    const report = await Report.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!report) {
      console.log(`Report not found or does not belong to user: ${req.params.id}`);
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }
    
    // Delete the report
    await Report.deleteOne({ _id: req.params.id, userId: req.userId });
    
    console.log(`Successfully deleted report: ${req.params.id}`);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      message: 'Error deleting report', 
      error: error.message,
      details: error.stack
    });
  }
});

module.exports = router;
