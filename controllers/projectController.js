const ObjectId = require('mongodb').ObjectID;
const Project = require('../models/projectModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.filterByMe = (req, res, next) => {
  req.params.employee = req.user.id;
  next();
};

exports.getAllProjects = factory.getAll(Project);
exports.getProject = factory.getOne(Project, { path: 'timesheets' });
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);

exports.getMyProjects = catchAsync(async (req, res, next) => {
  const data = await Project.find({
    $or: [
      { partner: { $eq: ObjectId(req.params.employee) } },
      { manager: { $eq: ObjectId(req.params.employee) } },
      { inCharge: { $eq: ObjectId(req.params.employee) } },
      { team: ObjectId(req.params.employee) },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: {
      data,
    },
  });
});
