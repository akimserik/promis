const mongoose = require('mongoose');

const projectStages = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [30, 'Stage name must be max 30 characters!'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description name must be max 200 characters!'],
  },
  budgetedHours: {
    type: Number,
    default: 0,
    min: [0, 'Bugeted hours must be a positive whole number above 0'],
  },
});

const projectSchema = new mongoose.Schema(
  {
    engagementCode: {
      type: String,
      required: [true, 'Engagement code empty'],
      unique: true,
      trim: true,
      maxlength: [
        17,
        'Engagement code must be max 17 characters. Example: AUD20-ABC-0101',
      ],
      minlength: [
        14,
        'Engagement code must be min 14 characters. Example: AUD20-ABC-0101',
      ],
    },

    clientName: {
      type: String,
      required: [true, 'Client name empty'],
      trim: true,
      maxlength: [50, 'Client name must be max 50 characters!'],
      minlength: [5, 'Client name must be min 5 characters!'],
    },

    targetName: {
      type: String,
      trim: true,
      maxlength: [50, 'Target name must be max 50 characters!'],
    },

    feeKZT: {
      type: Number,
      required: [true, 'Fee (KZT) is empty'],
      min: [1, 'Fee must be above 1.00 KZT'],
    },

    budgetedHours: {
      type: Number,
      required: [true, 'Budgeted hours field is empty'],
      min: [1, 'Budgeted hours must be above 1 hour'],
    },

    budgetedRealization: {
      type: Number,
      required: [true, 'Budgeted realization field is empty'],
      min: [1, 'Budgeted realization must be above 1%'],
      set: (val) => Math.round(val * 10) / 10,
      default: 30,
    },

    serviceLine: {
      type: String,
      required: [true, 'Service line empty!'],
      enum: {
        values: ['Audit', 'Advisory', 'Tax', 'Outsourcing'],
        message: 'Service line is invalid',
      },
    },

    contractSubject: {
      type: String,
      trim: true,
      maxlength: [100, 'Contract subject name must be max 100 characters!'],
    },

    contractSignedDate: {
      type: Date,
    },

    expectedDateOfReport: {
      type: Date,
      required: [true, 'Expected date of report is empty!'],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [20, 'Location must be max 20 characters!'],
    },

    completion: {
      type: Number,
      default: 0,
      min: [0, 'Completion must be between 0 and 100 %'],
      max: [100, 'Completion must be between 0 and 100 %'],
    },

    partner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Partner empty!'],
    },

    manager: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Manager empty!'],
    },

    inCharge: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },

    publicListed: {
      type: Boolean,
      default: false,
    },

    team: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    stages: [projectStages],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDLEWARE
projectSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'partner',
    select: 'name',
  });

  this.populate({
    path: 'manager',
    select: 'name',
  });

  this.populate({
    path: 'inCharge',
    select: 'name',
  });

  this.populate({
    path: 'team',
    select: 'name position',
  });

  this.populate({
    path: 'stages',
    select: '-budgetedHours',
  });

  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
