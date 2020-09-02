const ObjectId = require('mongodb').ObjectID;
const Timesheet = require('../models/timesheetModel');
const catchAsync = require('../utils/catchAsync');
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

exports.getTimesheetDailyStats = catchAsync(async (req, res, next) => {
  const stats = await Timesheet.aggregate([
    { $match: { employee: ObjectId(req.params.employee) } },
    {
      $group: {
        _id: {
          doc_id: '$_id',
          stage: '$projectStage',
          date: '$date',
          project: '$project',
          comment: '$comment',
        },
        hours: { $sum: '$chargedHours' },
      },
    },
    {
      $group: {
        _id: { date: '$_id.date', project: '$_id.project' },
        stages: {
          $push: {
            doc_id: '$_id.doc_id',
            stage: '$_id.stage',
            hours: '$hours',
            comment: '$_id.comment',
          },
        },
        hours: { $sum: '$hours' },
      },
    },
    {
      $group: {
        _id: '$_id.project',
        dates: {
          $push: { date: '$_id.date', stages: '$stages', hours: '$hours' },
        },
        hours: { $sum: '$hours' },
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project',
      },
    },
    { $unwind: '$project' },
    {
      $project: {
        _id: 1,
        dates: 1,
        hours: 1,
        'project.engagementCode': 1,
        'project.clientName': 1,
        'project.completion': 1,
        'project.expectedDateOfReport': 1,
        'project.partner': 1,
        'project.manager': 1,
        'project.inCharge': 1,
        'project.serviceLine': 1,
        'project.stages': 1,
        'project.team': 1,
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
