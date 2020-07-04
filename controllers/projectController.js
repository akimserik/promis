const Project = require('../models/projectModel');
const factory = require('./handlerFactory');

exports.getAllProjects = factory.getAll(Project);
exports.getProject = factory.getOne(Project, { path: 'timesheets' });
exports.createProject = factory.createOne(Project);
exports.updateProject = factory.updateOne(Project);
exports.deleteProject = factory.deleteOne(Project);
