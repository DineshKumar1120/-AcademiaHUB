const Assignment = require('../models/Assignment');
const AssignmentQuestion = require('../models/AssignmentQuestion');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res, next) => {
  try {
    const { departmentId, subjectId, status, type, search } = req.query;
    let query = {};

    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user.id });
      if (student && student.departmentId) {
        query.departmentId = student.departmentId;
      }
    }

    if (req.query.myOnly === 'true' && req.user.role === 'FACULTY') {
      query.createdBy = req.user.id;
    }

    if (departmentId) query.departmentId = departmentId;
    if (subjectId) query.subjectId = subjectId;
    if (type) query.type = type.toUpperCase();
    if (status) query.status = status.toUpperCase();

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code semester')
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    let assignmentsWithStatus = assignments;
    if (req.user.role === 'STUDENT') {
      const submissions = await AssignmentSubmission.find({ studentId: req.user.id });
      const subMap = {};
      submissions.forEach(sub => {
        subMap[sub.assignmentId.toString()] = sub;
      });

      assignmentsWithStatus = assignments.map(assign => {
        const doc = assign.toObject();
        doc.submission = subMap[assign._id.toString()] || null;
        return doc;
      });
    }

    res.status(200).json({
      success: true,
      count: assignmentsWithStatus.length,
      assignments: assignmentsWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment details
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('subjectId', 'name code semester')
      .populate('departmentId', 'name code')
      .populate('createdBy', 'name email phone');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submission = null;
    if (req.user.role === 'STUDENT') {
      submission = await AssignmentSubmission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id
      }).populate('gradedBy', 'name');
    }

    res.status(200).json({
      success: true,
      assignment,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MCQ questions for assignment
// @route   GET /api/assignments/:id/questions
// @access  Private
exports.getAssignmentQuestions = async (req, res, next) => {
  try {
    const isStudent = req.user.role === 'STUDENT';
    const selectFields = isStudent ? '-correctOptionLetter' : '';
    
    const questions = await AssignmentQuestion.find({ assignmentId: req.params.id }).select(selectFields);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment (File, MCQ, or Programming)
// @route   POST /api/assignments
// @access  Private (Faculty, Admin)
exports.createAssignment = async (req, res, next) => {
  try {
    const {
      title, description, type, subjectId, departmentId, dueDate, totalMarks, timeLimitMinutes,
      problemStatement, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, questions, testCases
    } = req.body;

    let attachmentUrl = '';
    let attachmentName = '';

    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    let parsedTestCases = [];
    if (testCases) {
      parsedTestCases = typeof testCases === 'string' ? JSON.parse(testCases) : testCases;
    }

    const assignment = await Assignment.create({
      title,
      description,
      type: type || 'FILE',
      subjectId,
      departmentId,
      dueDate,
      totalMarks: totalMarks || 100,
      timeLimitMinutes: timeLimitMinutes || 30,
      problemStatement: problemStatement || '',
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      constraints: constraints || '',
      sampleInput: sampleInput || '',
      sampleOutput: sampleOutput || '',
      testCases: parsedTestCases,
      attachmentUrl,
      attachmentName,
      createdBy: req.user.id
    });

    // If MCQ questions sent as JSON string or array
    if (questions) {
      let qList = typeof questions === 'string' ? JSON.parse(questions) : questions;
      if (Array.isArray(qList) && qList.length > 0) {
        const preparedQs = qList.map(q => ({
          assignmentId: assignment._id,
          questionText: q.questionText,
          options: q.options,
          correctOptionLetter: q.correctOptionLetter,
          marks: q.marks || 5
        }));
        await AssignmentQuestion.insertMany(preparedQs);
      }
    }

    // Notify students in department
    const studentsInDept = await Student.find({ departmentId }).select('userId');
    const notifications = studentsInDept.map(s => ({
      userId: s.userId,
      title: `New ${assignment.type} Assignment Posted`,
      message: `New assignment "${title}" (${assignment.type}) is available. Due: ${new Date(dueDate).toLocaleDateString()}`,
      type: 'ASSIGNMENT',
      link: `/assignments/${assignment._id}`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Faculty, Admin)
exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'FACULTY' && assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only delete assignments created by you' });
    }

    await AssignmentQuestion.deleteMany({ assignmentId: assignment._id });
    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment, questions, and submissions deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
