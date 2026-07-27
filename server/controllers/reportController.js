const AssignmentSubmission = require('../models/AssignmentSubmission');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Export Student Marks & Details to CSV
// @route   GET /api/reports/export/csv
// @access  Private (Faculty, Admin)
exports.exportCSV = async (req, res, next) => {
  try {
    const { departmentId, subjectId, assignmentId } = req.query;
    let filter = {};

    if (assignmentId) filter.assignmentId = assignmentId;

    const submissions = await AssignmentSubmission.find(filter)
      .populate({
        path: 'assignmentId',
        select: 'title totalMarks subjectId departmentId',
        populate: { path: 'subjectId', select: 'name code' }
      })
      .populate('studentId', 'name email phone')
      .sort({ submissionDate: -1 });

    // Filter by departmentId or subjectId if provided
    let filteredList = submissions.filter(s => s.assignmentId && s.studentId);
    if (departmentId) {
      filteredList = filteredList.filter(s => s.assignmentId.departmentId?.toString() === departmentId);
    }
    if (subjectId) {
      filteredList = filteredList.filter(s => s.assignmentId.subjectId?._id?.toString() === subjectId);
    }

    let csvContent = 'Student Name,Student Email,Assignment Title,Subject Code,Submission Date,Status,Marks Obtained,Total Marks,Feedback\n';

    filteredList.forEach(item => {
      const studentName = `"${item.studentId.name || ''}"`;
      const studentEmail = `"${item.studentId.email || ''}"`;
      const title = `"${item.assignmentId.title || ''}"`;
      const subjectCode = `"${item.assignmentId.subjectId?.code || ''}"`;
      const date = `"${new Date(item.submissionDate).toISOString().split('T')[0]}"`;
      const status = `"${item.status || ''}"`;
      const marks = item.marksObtained !== null ? item.marksObtained : 'N/A';
      const total = item.assignmentId.totalMarks || 100;
      const feedback = `"${(item.feedback || '').replace(/"/g, '""')}"`;

      csvContent += `${studentName},${studentEmail},${title},${subjectCode},${date},${status},${marks},${total},${feedback}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=student_marks_report_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Export Printable Report Data for PDF Generator
// @route   GET /api/reports/export/pdf-data
// @access  Private (Faculty, Admin)
exports.exportPDFData = async (req, res, next) => {
  try {
    const { departmentId, subjectId, assignmentId } = req.query;
    let filter = {};

    if (assignmentId) filter.assignmentId = assignmentId;

    const submissions = await AssignmentSubmission.find(filter)
      .populate({
        path: 'assignmentId',
        select: 'title totalMarks subjectId departmentId',
        populate: [
          { path: 'subjectId', select: 'name code' },
          { path: 'departmentId', select: 'name code' }
        ]
      })
      .populate('studentId', 'name email phone')
      .sort({ submissionDate: -1 });

    let filteredList = submissions.filter(s => s.assignmentId && s.studentId);
    if (departmentId) {
      filteredList = filteredList.filter(s => s.assignmentId.departmentId?._id?.toString() === departmentId);
    }
    if (subjectId) {
      filteredList = filteredList.filter(s => s.assignmentId.subjectId?._id?.toString() === subjectId);
    }

    res.status(200).json({
      success: true,
      count: filteredList.length,
      generatedAt: new Date(),
      submissions: filteredList
    });
  } catch (error) {
    next(error);
  }
};
