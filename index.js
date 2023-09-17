import * as dotenv from 'dotenv';
import 'express-async-errors';
import Express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';

import { API_VERSION } from './utils/constants.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';
import errorHandler from './middlewares/errorHandlerMiddleware.js';
import { authenticateUser } from './middlewares/authMiddleware.js';

const app = Express();

dotenv.config();

// Cloudinary config for save user profile image
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Morgan for logging API request on development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security Purposes
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(ExpressMongoSanitize());
app.use(
  cors({
    origin: ['https://fikri-jobtracker.vercel.app', 'http://localhost:5000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Cookie and Json parser
app.use(cookieParser());
app.use(Express.json());

// Auth routes
app.use(`${API_VERSION}/auth`, authRoutes);
// User routes
app.use(`${API_VERSION}/user`, authenticateUser, userRoutes);
// Job routes
app.use(`${API_VERSION}/jobs`, authenticateUser, jobRoutes);

// Error 404 routes not found
app.use('*', (req, res, next) => {
  res.status(404).json({ message: 'request is not found' });
});

// Error handler Middleware
app.use(errorHandler);

// Port configuration & connection to MongoDB
const PORT = process.env.PORT || 3000;
try {
  await mongoose.connect(process.env.MONGO_URL);

  app.listen(PORT, () => {
    console.log(`Server is Running on PORT ${PORT}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
