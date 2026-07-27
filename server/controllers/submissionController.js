const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment');
const AssignmentQuestion = require('../models/AssignmentQuestion');
const Notification = require('../models/Notification');
const { executeCode } = require('../services/codeExecutionService');
const path = require('path');
const fs = require('fs');

// Helper to normalize strings for comparison
const normalizeOutput = (str) => {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n').trim();
};

// @desc    Run Code Solution against Sample Test Cases (Student)
// @route   POST /api/submissions/programming/run
// @access  Private (Student)
exports.runCode = async (req, res, next) => {
  try {
    const { assignmentId, code, language } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide code to run' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Determine test cases to run
    let testCasesToRun = (assignment.testCases || []).filter(tc => !tc.isHidden);
    
    // Fallback to sampleInput / sampleOutput if no test cases defined
    if (testCasesToRun.length === 0) {
      testCasesToRun = [
        {
          _id: 'sample_1',
          input: assignment.sampleInput || '',
          expectedOutput: assignment.sampleOutput || '',
          isHidden: false
        }
      ];
    }

    const testResults = [];
    let allPassed = true;
    let compilationError = null;

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const execResult = await executeCode(language || 'python', code, tc.input);

      if (execResult.exitCode !== 0 && !execResult.stdout) {
        compilationError = execResult.error || execResult.stderr || execResult.output;
      }

      const actualTrimmed = normalizeOutput(execResult.stdout || execResult.output);
      const expectedTrimmed = normalizeOutput(tc.expectedOutput);
      const passed = execResult.success && actualTrimmed === expectedTrimmed;

      if (!passed) {
        allPassed = false;
      }

      testResults.push({
        testCaseIndex: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: execResult.stdout || execResult.output,
        passed,
        error: execResult.stderr || (passed ? '' : 'Output mismatch'),
        isHidden: tc.isHidden || false
      });
    }

    let overallStatus = 'ACCEPTED';
    if (compilationError) {
      overallStatus = 'COMPILATION_ERROR';
    } else if (!allPassed) {
      overallStatus = 'WRONG_ANSWER';
    }

    res.status(200).json({
      success: true,
      status: overallStatus,
      allPassed,
      compilationError,
      testResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Programming Assignment Code & Auto-Grade (Student)
// @route   POST /api/submissions/programming/submit
// @access  Private (Student)
exports.submitProgramming = async (req, res, next) => {
  try {
    const { assignmentId, programmingCode, code, language } = req.body;
    const finalCode = code || programmingCode;

    if (!finalCode) {
      return res.status(400).json({ success: false, message: 'Please provide code to submit' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Determine all test cases (including hidden)
    let testCasesToRun = assignment.testCases || [];
    if (testCasesToRun.length === 0) {
      testCasesToRun = [
        {
          _id: 'sample_1',
          input: assignment.sampleInput || '',
          expectedOutput: assignment.sampleOutput || '',
          isHidden: false
        }
      ];
    }

    const testResults = [];
    let passedCount = 0;

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const execResult = await executeCode(language || 'python', finalCode, tc.input);

      const actualTrimmed = normalizeOutput(execResult.stdout || execResult.output);
      const expectedTrimmed = normalizeOutput(tc.expectedOutput);
      const passed = execResult.success && actualTrimmed === expectedTrimmed;

      if (passed) {
        passedCount++;
      }

      testResults.push({
        testCaseIndex: i + 1,
        passed,
        actualOutput: tc.isHidden ? '(Hidden Test Case)' : (execResult.stdout || execResult.output),
        expectedOutput: tc.isHidden ? '(Hidden Test Case)' : tc.expectedOutput,
        error: execResult.stderr || (passed ? '' : 'Output mismatch'),
        isHidden: tc.isHidden || false
      });
    }

    const totalCount = testCasesToRun.length;
    const calculatedMarks = Math.round((passedCount / totalCount) * (assignment.totalMarks || 100));

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const status = 'GRADED';

    let submission = await AssignmentSubmission.findOne({ assignmentId, studentId: req.user.id });

    const feedback = `Automated Code Evaluation: Passed ${passedCount}/${totalCount} test cases (${calculatedMarks}/${assignment.totalMarks || 100} marks)`;

    if (submission) {
      submission.programmingCode = finalCode;
      submission.code = finalCode;
      submission.language = language || 'python';
      submission.testResults = testResults;
      submission.passedTestCases = passedCount;
      submission.totalTestCases = totalCount;
      submission.marksObtained = calculatedMarks;
      submission.feedback = feedback;
      submission.submissionDate = now;
      submission.status = status;
      submission.gradedAt = now;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId: req.user.id,
        programmingCode: finalCode,
        code: finalCode,
        language: language || 'python',
        testResults,
        passedTestCases: passedCount,
        totalTestCases: totalCount,
        marksObtained: calculatedMarks,
        feedback,
        submissionDate: now,
        status,
        gradedAt: now
      });
    }

    // Create Notification
    await Notification.create({
      userId: req.user.id,
      title: 'Programming Assignment Evaluated',
      message: `Your code for "${assignment.title}" scored ${calculatedMarks}/${assignment.totalMarks || 100} (${passedCount}/${totalCount} test cases passed)`,
      type: 'GRADE',
      link: `/assignments/${assignment._id}`
    });

    res.status(200).json({
      success: true,
      message: `Code solution evaluated! Score: ${calculatedMarks} / ${assignment.totalMarks || 100}`,
      marksObtained: calculatedMarks,
      totalMarks: assignment.totalMarks || 100,
      passedTestCases: passedCount,
      totalTestCases: totalCount,
      testResults,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit File assignment (Student)
// @route   POST /api/submissions/upload
// @access  Private (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a submission file' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const status = isLate ? 'LATE' : 'SUBMITTED';

    let submission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (submission) {
      submission.fileUrl = `/uploads/${req.file.filename}`;
      submission.fileName = req.file.originalname;
      submission.submissionDate = now;
      submission.status = status;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId: req.user.id,
        fileUrl: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        submissionDate: now,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit MCQ Quiz & Auto-Grade (Student)
// @route   POST /api/submissions/mcq/submit
// @access  Private (Student)
exports.submitMCQ = async (req, res, next) => {
  try {
    const { assignmentId, answers } = req.body; // answers = [{ questionId, selectedOption }]

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const questions = await AssignmentQuestion.find({ assignmentId });
    const qMap = {};
    questions.forEach(q => { qMap[q._id.toString()] = q; });

    let calculatedScore = 0;
    const formattedAnswers = [];

    if (Array.isArray(answers)) {
      answers.forEach(item => {
        const q = qMap[item.questionId];
        if (q) {
          formattedAnswers.push({
            questionId: q._id,
            selectedOption: item.selectedOption
          });
          if (item.selectedOption && item.selectedOption.toUpperCase() === q.correctOptionLetter.toUpperCase()) {
            calculatedScore += q.marks;
          }
        }
      });
    }

    const now = new Date();
    let submission = await AssignmentSubmission.findOne({ assignmentId, studentId: req.user.id });

    if (submission) {
      submission.mcqAnswers = formattedAnswers;
      submission.marksObtained = calculatedScore;
      submission.submissionDate = now;
      submission.status = 'GRADED';
      submission.feedback = `Automated MCQ Evaluation: ${calculatedScore} / ${assignment.totalMarks}`;
      submission.gradedAt = now;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId: req.user.id,
        mcqAnswers: formattedAnswers,
        marksObtained: calculatedScore,
        submissionDate: now,
        status: 'GRADED',
        feedback: `Automated MCQ Evaluation: ${calculatedScore} / ${assignment.totalMarks}`,
        gradedAt: now
      });
    }

    res.status(200).json({
      success: true,
      message: `Quiz completed! Score: ${calculatedScore} / ${assignment.totalMarks}`,
      score: calculatedScore,
      totalMarks: assignment.totalMarks,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Programming Assignment Code (Student)
// @route   POST /api/submissions/programming/submit
// @access  Private (Student)
exports.submitProgramming = async (req, res, next) => {
  try {
    const { assignmentId, programmingCode, language } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const status = isLate ? 'LATE' : 'SUBMITTED';

    let submission = await AssignmentSubmission.findOne({ assignmentId, studentId: req.user.id });

    if (submission) {
      submission.programmingCode = programmingCode;
      submission.language = language || 'cpp';
      submission.submissionDate = now;
      submission.status = status;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId: req.user.id,
        programmingCode,
        language: language || 'cpp',
        submissionDate: now,
        status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code solution submitted successfully for evaluation',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private (Faculty, Admin)
exports.getSubmissionsByAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissions = await AssignmentSubmission.find({ assignmentId: req.params.assignmentId })
      .populate('studentId', 'name email phone avatar')
      .populate('gradedBy', 'name')
      .sort({ submissionDate: -1 });

    res.status(200).json({
      success: true,
      assignment,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Faculty, Admin)
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { marksObtained, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(req.params.id).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.marksObtained = marksObtained;
    submission.feedback = feedback || '';
    submission.status = 'GRADED';
    submission.gradedBy = req.user.id;
    submission.gradedAt = Date.now();
    await submission.save();

    await Notification.create({
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${submission.assignmentId.title}" has been graded: ${marksObtained}/${submission.assignmentId.totalMarks}`,
      type: 'GRADE',
      link: `/assignments/${submission.assignmentId._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download submission file
// @route   GET /api/submissions/download/:filename
// @access  Private
exports.downloadFile = async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
