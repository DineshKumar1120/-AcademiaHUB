const express = require('express');
const router = express.Router();
const { exportCSV, exportPDFData } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/export/csv', authorize('FACULTY', 'ADMIN'), exportCSV);
router.get('/export/pdf-data', authorize('FACULTY', 'ADMIN'), exportPDFData);

module.exports = router;
