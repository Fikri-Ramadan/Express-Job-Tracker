import { StatusCodes } from 'http-status-codes';

const errorHandler = (err, req, res, next) => {
  console.log(err)
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const errorMessage = err.message || 'something went wrong';
  res.status(statusCode).json({ message: errorMessage});
};

export default errorHandler;
