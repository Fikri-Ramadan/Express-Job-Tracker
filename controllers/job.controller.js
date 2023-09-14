import mongoose from 'mongoose';
import day from 'dayjs';
import { StatusCodes } from 'http-status-codes';

import Job from '../models/Job.model.js';

export const getAllJobs = async (req, res, next) => {
  const { userId } = req.user;
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObject = {
    createdBy: userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }

  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  const totalJobs = await Job.countDocuments(queryObject);

  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const totalPage = Math.ceil(totalJobs / limit);

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  res
    .status(StatusCodes.OK)
    .json({ totalJobs, totalPage, currentPage: page, jobs });
};

export const getJob = async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  res.status(StatusCodes.OK).json({ data: job });
};

export const createJob = async (req, res, next) => {
  const { userId } = req.user;
  req.body.createdBy = userId;
  const job = await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({ message: 'create successfuly', job });
};

export const updateJob = async (req, res, next) => {
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res
    .status(StatusCodes.OK)
    .json({ message: 'update successfuly', job: updatedJob });
};

export const deleteJob = async (req, res, next) => {
  const deletedJob = await Job.findByIdAndDelete(req.params.id);
  res
    .status(StatusCodes.OK)
    .json({ message: 'delete successfuly', job: deletedJob });
};

export const showStats = async (req, res, next) => {
  const { userId } = req.user;

  let jobStats = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$jobStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  let stats = {};

  jobStats.map((stat) => {
    const { _id, count } = stat;
    stats[_id] = count || 0;
  });

  stats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyStats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyStats = monthlyStats
    .map((montlyStat) => {
      const {
        _id: { year, month },
        count,
      } = montlyStat;

      const date = day().month(month).year(year).format('MMM YY');

      return { date, count };
    })
    .reverse();

  res.json({ stats, monthlyStats });
};
