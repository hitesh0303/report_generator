const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: String,
  subjectName: String,
  facultyName: String,
  date: String,
  studentsAttended: Number,
  objectives: [String],
  description: String,
  learningOutcomes: String,
  targetYear: String,
  images: [String],
  feedback: [{ rollNo: String, expectation: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
