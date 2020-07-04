const Timesheet = require('../models/timesheetModel');
const factory = require('./handlerFactory');

exports.setUserID = (req, res, next) => {
  // Allow nested route
  if (!req.body.user) req.body.employee = req.user.id;
  next();
};

exports.filterByMe = (req, res, next) => {
  req.params.employee = req.user.id;
  next();
};

exports.getAllTimesheets = factory.getAll(Timesheet);
exports.getTimesheet = factory.getOne(Timesheet);
exports.createTimesheet = factory.createOne(Timesheet);
exports.updateTimesheet = factory.updateOne(Timesheet);
exports.deleteTimesheet = factory.deleteOne(Timesheet);
