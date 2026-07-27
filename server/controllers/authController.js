const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Course = require('../models/Course');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user (Student or Faculty)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, rollNo, employeeId, departmentId, courseId, semester, designation, specialization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    const userRole = role ? role.toUpperCase() : 'STUDENT';
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone
    });

    if (userRole === 'STUDENT') {
      let dept = departmentId;
      let crs = courseId;
      if (!dept) {
        const defaultDept = await Department.findOne();
        if (defaultDept) dept = defaultDept._id;
      }
      if (!crs) {
        const defaultCourse = await Course.findOne();
        if (defaultCourse) crs = defaultCourse._id;
      }
      await Student.create({
        userId: user._id,
        rollNo: rollNo || `STU-${Date.now().toString().slice(-6)}`,
        departmentId: dept,
        courseId: crs,
        semester: semester || 1
      });
    } else if (userRole === 'FACULTY') {
      let dept = departmentId;
      if (!dept) {
        const defaultDept = await Department.findOne();
        if (defaultDept) dept = defaultDept._id;
      }
      await Faculty.create({
        userId: user._id,
        employeeId: employeeId || `EMP-${Date.now().toString().slice(-6)}`,
        departmentId: dept,
        designation: designation || 'Assistant Professor',
        specialization: specialization || 'Computer Science'
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await Student.findOne({ userId: user._id }).populate('departmentId courseId');
    } else if (user.role === 'FACULTY') {
      profile = await Faculty.findOne({ userId: user._id }).populate('departmentId');
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'STUDENT') {
      profile = await Student.findOne({ userId: user._id }).populate('departmentId courseId');
    } else if (user.role === 'FACULTY') {
      profile = await Faculty.findOne({ userId: user._id }).populate('departmentId');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email address' });
    }

    // Generate reset token string
    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: `Password reset code sent to email (Demo Code: ${resetToken})`,
      resetToken // Returned for convenience in demo application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
