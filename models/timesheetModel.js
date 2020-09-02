const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Timesheet date is empty!'],
    },

    employee: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'User is empty!'],
    },

    project: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      validate: {
        // works only with NEW document, not for UPDATE
        validator: function (val) {
          return this.nonChargeableActivity === undefined;
        },
        message:
          'Cannot charge for both project and non-chargeable activity! Please select one.',
      },
    },

    nonChargeableActivity: {
      type: String,
      enum: {
        values: ['Business development', 'Recruiting', 'Leave'],
        message: 'Invalid value: non-chargeable activity',
      },
      validate: {
        // works only with NEW document, not for UPDATE
        validator: function (val) {
          return this.project === undefined;
        },
        message:
          'Cannot charge for both project and non-chargeable activity! Please select one.',
      },
    },

    chargedHours: {
      type: Number,
      required: [true, 'Charged hours empty!'],
      min: [0.5, 'Minimum charged hours must be 0.5'],
      max: [16, 'Charged hours can be maximum 16 per day'],
    },

    projectStage: {
      type: mongoose.Types.ObjectId,
    },

    comment: {
      type: String,
      max: [100, 'Please enter max 100 symbols for comment'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

timesheetSchema.virtual('projectDetails', {
  ref: 'Project',
  foreignField: '_id',
  localField: 'project',
});

// QUERY MIDDLEWARE
timesheetSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'employee',
    select: 'name',
  });

  next();
});

timesheetSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'project',
    select: 'engagementCode clientName completion',
  });

  next();
});

timesheetSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'projectStage',
    select: 'name',
  });

  next();
});

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

module.exports = Timesheet;
