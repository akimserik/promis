const express = require('express');

const router = express.Router();

const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

// protects all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(
    authController.restrictTo('admin', 'support'),
    projectController.createProject
  );

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(
    authController.restrictTo('admin', 'support'),
    projectController.updateProject
  )
  .delete(authController.restrictTo('admin'), projectController.deleteProject);

module.exports = router;
