const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'User must be max 50 characters!'],
  },

  email: {
    type: String,
    required: [true, 'Please enter email'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  role: {
    type: String,
    required: [true, 'Please enter user role'],
    enum: ['staff', 'HR', 'support', 'manager', 'partner', 'admin'],
    default: 'staff',
  },

  password: {
    type: String,
    required: [true, 'Please enter password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      // Only works On Save! Not on FindOneAndUpdate
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },

  firstName: {
    type: String,
    required: [true, 'First name empty'],
    trim: true,
    maxlength: [20, 'First name must be max 20 characters!'],
  },

  lastName: {
    type: String,
    required: [true, 'Last name empty'],
    trim: true,
    maxlength: [30, 'Last name must be max 50 characters!'],
  },

  department: {
    type: String,
    required: [true, 'Department empty!'],
    enum: {
      values: ['Assurance', 'Advisory', 'Tax', 'Outsourcing', 'Admin'],
      message: 'Department is invalid',
    },
  },

  hiredDate: {
    type: Date,
    required: [true, 'Hired date is empty!'],
  },

  resignedDate: {
    type: Date,
  },

  office: {
    type: String,
    required: [true, 'Employee office is empty!'],
    enum: {
      values: ['Almaty', 'Astana'],
      message: 'Invalid value: employee office',
    },
  },

  position: {
    type: String,
    required: [true, 'Employee position is empty!'],
    enum: {
      values: [
        'MP',
        'P',
        'D',
        'SM1',
        'SM2',
        'M1',
        'M2',
        'AM',
        'S1',
        'S2',
        'S3',
        'A1',
        'A2',
        'A3',
        'INT',
      ],
      message: 'Invalid value: employee position',
    },
  },
});

// MIDDLEWARE - setting password
userSchema.pre('save', async function (next) {
  // only run if password was modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

// MIDDLEWARE - updating passwordChangedAt on password reset
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// MIDDLEWARE - exclude inactive users from find* queries
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
