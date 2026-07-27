const mongoose = require('mongoose');

const assignmentQuestionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    options: [
      {
        optionLetter: { type: String, required: true }, // e.g. 'A', 'B', 'C', 'D'
        optionText: { type: String, required: true }
      }
    ],
    correctOptionLetter: {
      type: String,
      required: true // e.g. 'A'
    },
    marks: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AssignmentQuestion', assignmentQuestionSchema);
