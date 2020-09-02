const express = require('express');

const router = express.Router();

const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

// protects all routes after this middleware
router.use(authController.protect);

router.get(
  '/my-projects',
  projectController.filterByMe,
  projectController.getMyProjects
);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(
    authController.restrictTo('admin', 'support', 'manager'),
    projectController.createProject
  );

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(
    authController.restrictTo('admin', 'support', 'manager'),
    projectController.updateProject
  )
  .delete(authController.restrictTo('admin'), projectController.deleteProject);

module.exports = router;
