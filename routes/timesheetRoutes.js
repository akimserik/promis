const express = require('express');

const router = express.Router({ mergeParams: true });
const timesheetController = require('../controllers/timesheetController');
const authController = require('../controllers/authController');

// protects all routes after this middleware
router.use(authController.protect);

router.get(
  '/my',
  timesheetController.filterByMe,
  timesheetController.getAllTimesheets
);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'support', 'HR', 'partner'),
    timesheetController.getAllTimesheets
  )
  .post(
    authController.restrictTo('staff', 'manager', 'partner'),
    timesheetController.setUserID,
    timesheetController.createTimesheet
  );

router
  .route('/:id')
  .get(timesheetController.getTimesheet)
  .patch(timesheetController.updateTimesheet)
  .delete(
    authController.restrictTo('admin', 'support'),
    timesheetController.deleteTimesheet
  );

module.exports = router;
