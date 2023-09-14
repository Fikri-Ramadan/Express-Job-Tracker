import cloudinary from 'cloudinary';
import { promises as fs } from 'fs';

import { StatusCodes } from 'http-status-codes';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';

export const getCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId });
  const userWithoutPassword = user.toJSON();
  res.status(StatusCodes.OK).json({ user: userWithoutPassword });
};

export const getApplicationStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  res.status(StatusCodes.OK).json({ totalUsers, totalJobs });
};

export const updateUser = async (req, res) => {
  const { userId } = req.user;
  const newUser = { ...req.body };

  delete newUser.password;

  if (req.file) {
    const response = await cloudinary.v2.uploader.upload(req.file.path);
    await fs.unlink(req.file.path);
    newUser.avatar = response.secure_url;
    newUser.avatarPublicId = response.public_id;
  }

  const oldUser = await User.findByIdAndUpdate(userId, newUser);

  if (req.file && oldUser.avatarPublicId) {
    await cloudinary.v2.uploader.destroy(oldUser.avatarPublicId);
  }

  res.status(StatusCodes.OK).json({ message: 'update successfuly' });
};
