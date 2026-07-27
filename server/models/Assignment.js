const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide assignment title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide assignment description']
    },
    type: {
      type: String,
      enum: ['FILE', 'MCQ', 'PROGRAMMING'],
      default: 'FILE'
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide due date']
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    timeLimitMinutes: {
      type: Number,
      default: 30 // For MCQ Quizzes
    },
    // Programming specific fields
    problemStatement: { type: String, default: '' },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    constraints: { type: String, default: '' },
    sampleInput: { type: String, default: '' },
    sampleOutput: { type: String, default: '' },
    allowedLanguages: {
      type: [String],
      default: ['python', 'javascript', 'cpp', 'java']
    },
    testCases: [
      {
        input: { type: String, default: '' },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
        weight: { type: Number, default: 1 }
      }
    ],
    starterCode: {
      type: Map,
      of: String,
      default: {}
    },
    // File assignment attachment
    attachmentUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED', 'ARCHIVED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
