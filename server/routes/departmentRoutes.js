const express = require('express');
const router = express.Router();
const {
  getDepartments, createDepartment, deleteDepartment,
  getCourses, createCourse, deleteCourse,
  getSubjects, createSubject, deleteSubject
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Department Endpoints
router.get('/departments', getDepartments);
router.post('/departments', authorize('ADMIN'), createDepartment);
router.delete('/departments/:id', authorize('ADMIN'), deleteDepartment);

// Course Endpoints
router.get('/courses', getCourses);
router.post('/courses', authorize('ADMIN'), createCourse);
router.delete('/courses/:id', authorize('ADMIN'), deleteCourse);

// Subject Endpoints
router.get('/subjects', getSubjects);
router.post('/subjects', authorize('ADMIN'), createSubject);
router.delete('/subjects/:id', authorize('ADMIN'), deleteSubject);

module.exports = router;
