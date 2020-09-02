const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const timesheetRouter = require('./timesheetRoutes');

// Handle NESTED ROUTE
// e.g. POST /users/43fg5kjx/timesheets
router.use('/:userId/timesheets', timesheetRouter);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protects all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);

router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUser);

// below routes are available only to specific roles
router.use(authController.restrictTo('admin', 'HR'));

router.route('/').post(userController.createUser);
router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
