const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide employee ID'],
      unique: true,
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    designation: {
      type: String,
      default: 'Assistant Professor'
    },
    specialization: {
      type: String,
      default: 'Computer Science & Engineering'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Faculty', facultySchema);
