const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentById,
  getAssignmentQuestions,
  createAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.get('/:id/questions', getAssignmentQuestions);

router.post('/', authorize('FACULTY', 'ADMIN'), upload.single('attachment'), createAssignment);
router.delete('/:id', authorize('FACULTY', 'ADMIN'), deleteAssignment);

module.exports = router;
