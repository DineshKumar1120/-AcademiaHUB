const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');

// --- DEPARTMENTS ---
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.create({ name, code, description });
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (error) {
    next(error);
  }
};

// --- COURSES ---
exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('departmentId', 'name code').sort({ name: 1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, departmentId, durationYears } = req.body;
    const course = await Course.create({ name, code, departmentId, durationYears });
    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

// --- SUBJECTS ---
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code')
      .populate('facultyId', 'name email')
      .sort({ name: 1 });
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    next(error);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, departmentId, courseId, semester, facultyId } = req.body;
    const subject = await Subject.create({ name, code, departmentId, courseId, semester, facultyId });
    res.status(201).json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};
