import { body, param, validationResult } from 'express-validator';
import mongoose, { Error } from 'mongoose';

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import { JOB_STATUS, JOB_TYPE } from '../utils/constants.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';

const withValidationErrors = (validateValue) => {
  return [
    validateValue,
    (req, res, next) => {
      const error = validationResult(req);

      if (!error.isEmpty()) {
        const errorMessages = error.array().map((error) => error.msg);

        if (errorMessages[0].includes('not found')) {
          throw new NotFoundError(errorMessages);
        }

        if (errorMessages[0].includes('unauthorized')) {
          throw new UnauthorizedError(errorMessages);
        }

        throw new BadRequestError(errorMessages);
      }

      next();
    },
  ];
};

export const validateJobInput = withValidationErrors([
  body('company').notEmpty().withMessage('company is required'),
  body('position').notEmpty().withMessage('position is required'),
  body('jobLocation').notEmpty().withMessage('job location is required'),
  body('jobStatus')
    .isIn(Object.values(JOB_STATUS))
    .withMessage('invalid status'),
  body('jobType').isIn(Object.values(JOB_TYPE)).withMessage('invalid type'),
]);

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) throw new Error('invalid mongoDB id');

    const job = await Job.findById(value);
    if (!job) throw new Error(`job with id ${value} is not found`);

    const { userId, role } = req.user;
    const isAdmin = role === 'admin';
    const isOwner = job.createdBy.toString() === userId;
    if (!isAdmin && !isOwner) throw new Error('unauthorized this resource');
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body('firstName').notEmpty().withMessage('first name is required'),
  body('lastName').notEmpty().withMessage('last name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new BadRequestError('email already exist');
    }),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters'),
]);

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
  body('password').notEmpty().withMessage('password is required'),
]);

export const validateUpdateUserInput = withValidationErrors([
  body('firstName').notEmpty().withMessage('first name is required'),
  body('lastName').notEmpty().withMessage('last name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      const { userId } = req.user;
      if (user && user._id.toString() !== userId)
        throw new BadRequestError('email already exist');
    }),
]);
