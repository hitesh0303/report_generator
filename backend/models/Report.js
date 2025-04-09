const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: String,
  subjectName: String,
  facultyName: String,
  date: String,
  eventDate: String,
  eventTime: String,
  organizer: [String],
  courseName: String,
  mode: String,
  link: String,
  studentsAttended: Number,
  objectives: [String],
  description: String,
  learningOutcomes: [String],
  outcomes: {
    type: [mongoose.Schema.Types.Mixed], // Can be String or Object
    default: []
  },
  targetYear: String,
  images: [String],
  feedback: Array,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportType: { type: String, default: 'teaching' },
  participationData: Object,
  targetAudience: String,
  time: String,
  organizedBy: String,
  committeeType: String,
  institution: String,
  venue: String,
  fee: String,
  participants: String,
  resourcePerson: [String],
  coPoMapping: [{
    code: String,
    description: String
  }],
  faculty: [{ 
    name: String,
    role: String
  }],
  students: [String],
  execution: String,
  // Update impactAnalysis to allow objects with title and content
  impactAnalysis: {
    type: [mongoose.Schema.Types.Mixed], // Can accept either String or Object
    default: []
  },
  chartImages: Array,
  excelData: Array,
  feedbackData: Array,
  categorizedImages: {
    team: [String],
    speakers: [String],
    certificates: [String],
    general: [String],
    winners: [String] // For backward compatibility
  }
}, { 
  timestamps: true, 
  strict: false, // Allow fields not specified in schema
  // Add this to prevent casting errors for nested document structures
  typePojoToMixed: false
});

// Add a pre-save middleware to handle array conversions
reportSchema.pre('save', function(next) {
  // Handle organizer field
  if (this.organizer && !Array.isArray(this.organizer)) {
    this.organizer = this.organizer ? [this.organizer] : [];
  }
  
  // Handle resourcePerson field
  if (this.resourcePerson && !Array.isArray(this.resourcePerson)) {
    this.resourcePerson = this.resourcePerson ? [this.resourcePerson] : [];
  }
  
  next();
});

module.exports = mongoose.model('Report', reportSchema);
