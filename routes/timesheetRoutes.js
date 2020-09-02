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

router.get(
  '/my-stats',
  timesheetController.filterByMe,
  timesheetController.getTimesheetDailyStats
);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'support', 'HR', 'partner'),
    timesheetController.getAllTimesheets
  )
  .post(timesheetController.setUserID, timesheetController.createTimesheet);

router
  .route('/:id')
  .get(timesheetController.getTimesheet)
  .patch(timesheetController.updateTimesheet)
  .delete(timesheetController.deleteTimesheet);

module.exports = router;
