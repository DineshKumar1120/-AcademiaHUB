const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  submitMCQ,
  runCode,
  submitProgramming,
  getSubmissionsByAssignment,
  gradeSubmission,
  downloadFile
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', authorize('STUDENT'), upload.single('submissionFile'), submitAssignment);
router.post('/mcq/submit', authorize('STUDENT'), submitMCQ);
router.post('/programming/run', authorize('STUDENT'), runCode);
router.post('/programming/submit', authorize('STUDENT'), submitProgramming);

router.get('/assignment/:assignmentId', authorize('FACULTY', 'ADMIN'), getSubmissionsByAssignment);
router.put('/:id/grade', authorize('FACULTY', 'ADMIN'), gradeSubmission);
router.get('/download/:filename', downloadFile);

module.exports = router;
