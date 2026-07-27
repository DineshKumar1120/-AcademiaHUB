const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// @desc    Get all users with optional role filtering
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) {
      query.role = role.toUpperCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with populated details
// @route   GET /api/users/students
// @access  Private (Admin, Faculty)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email phone avatar isActive')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty members with populated details
// @route   GET /api/users/faculty
// @access  Private (Admin)
exports.getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find()
      .populate('userId', 'name email phone avatar isActive')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create User (Admin)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, rollNo, employeeId, departmentId, courseId, semester, designation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password123!',
      role: role ? role.toUpperCase() : 'STUDENT',
      phone
    });

    if (user.role === 'STUDENT') {
      await Student.create({
        userId: user._id,
        rollNo: rollNo || `STU-${Date.now().toString().slice(-6)}`,
        departmentId,
        courseId,
        semester: semester || 1
      });
    } else if (user.role === 'FACULTY') {
      await Faculty.create({
        userId: user._id,
        employeeId: employeeId || `EMP-${Date.now().toString().slice(-6)}`,
        departmentId,
        designation: designation || 'Assistant Professor'
      });
    }

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active / Inactive)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'STUDENT') {
      await Student.deleteOne({ userId: user._id });
    } else if (user.role === 'FACULTY') {
      await Faculty.deleteOne({ userId: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
