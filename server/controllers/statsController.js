const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');

// @desc    Get dashboard metrics & cards based on role
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    let stats = {};

    if (role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user.id });
      const deptFilter = student ? { departmentId: student.departmentId } : {};

      const totalAssignments = await Assignment.countDocuments(deptFilter);
      const studentSubmissions = await AssignmentSubmission.find({ studentId: req.user.id });
      
      const submittedCount = studentSubmissions.length;
      const gradedCount = studentSubmissions.filter(s => s.status === 'GRADED').length;
      const pendingCount = totalAssignments - submittedCount;

      const upcomingAssignments = await Assignment.find({
        ...deptFilter,
        dueDate: { $gte: new Date() },
        status: 'ACTIVE'
      })
        .populate('subjectId', 'name code')
        .sort({ dueDate: 1 })
        .limit(5);

      const recentSubmissions = await AssignmentSubmission.find({ studentId: req.user.id })
        .populate({
          path: 'assignmentId',
          select: 'title dueDate totalMarks',
          populate: { path: 'subjectId', select: 'name code' }
        })
        .sort({ submissionDate: -1 })
        .limit(5);

      stats = {
        totalAssignments,
        pendingAssignments: pendingCount < 0 ? 0 : pendingCount,
        submittedAssignments: submittedCount,
        gradedAssignments: gradedCount,
        upcomingAssignments,
        recentSubmissions
      };

    } else if (role === 'FACULTY') {
      const myAssignments = await Assignment.find({ createdBy: req.user.id });
      const assignmentIds = myAssignments.map(a => a._id);

      const totalCreated = myAssignments.length;
      const activeAssignments = myAssignments.filter(a => a.status === 'ACTIVE').length;

      const totalSubmissionsReceived = await AssignmentSubmission.countDocuments({
        assignmentId: { $in: assignmentIds }
      });
      const pendingGradingCount = await AssignmentSubmission.countDocuments({
        assignmentId: { $in: assignmentIds },
        status: { $ne: 'GRADED' }
      });

      const recentAssignments = await Assignment.find({ createdBy: req.user.id })
        .populate('subjectId', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalCreatedAssignments: totalCreated,
        activeAssignments,
        totalSubmissionsReceived,
        pendingGradingCount,
        recentAssignments
      };

    } else if (role === 'ADMIN') {
      const totalStudents = await User.countDocuments({ role: 'STUDENT' });
      const totalFaculty = await User.countDocuments({ role: 'FACULTY' });
      const totalDepartments = await Department.countDocuments();
      const totalCourses = await Course.countDocuments();
      const totalSubjects = await Subject.countDocuments();
      const totalAssignments = await Assignment.countDocuments();
      const totalSubmissions = await AssignmentSubmission.countDocuments();

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

      stats = {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalCourses,
        totalSubjects,
        totalAssignments,
        totalSubmissions,
        recentUsers
      };
    }

    res.status(200).json({
      success: true,
      role,
      stats
    });
  } catch (error) {
    next(error);
  }
};
