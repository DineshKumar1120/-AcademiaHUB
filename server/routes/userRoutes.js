const express = require('express');
const router = express.Router();
const { getUsers, getStudents, getFaculty, createUser, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/students', getStudents);
router.get('/faculty', authorize('ADMIN'), getFaculty);

router.get('/', authorize('ADMIN'), getUsers);
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id/status', authorize('ADMIN'), toggleUserStatus);
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;
