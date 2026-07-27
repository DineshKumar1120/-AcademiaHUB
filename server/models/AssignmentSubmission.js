const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // File submission
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    // MCQ submission
    mcqAnswers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignmentQuestion' },
        selectedOption: { type: String, default: '' }
      }
    ],
    // Programming submission
    programmingCode: { type: String, default: '' },
    code: { type: String, default: '' },
    language: { type: String, default: 'python' },
    testResults: [
      {
        testCaseIndex: { type: Number },
        passed: { type: Boolean, default: false },
        actualOutput: { type: String, default: '' },
        expectedOutput: { type: String, default: '' },
        error: { type: String, default: '' },
        isHidden: { type: Boolean, default: false }
      }
    ],
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },

    submissionDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'LATE'],
      default: 'SUBMITTED'
    },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, default: '' },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    gradedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
