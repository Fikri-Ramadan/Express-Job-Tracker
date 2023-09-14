import 'express-async-errors';
import Express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

import { API_VERSION } from './utils/constants.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import jobRoutes from './routes/job.routes.js';
import errorHandler from './middlewares/errorHandlerMiddleware.js';
import { authenticateUser } from './middlewares/authMiddleware.js';

const app = Express();
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  cors({
    origin: ['https://fikri-jobtracker.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(Express.static(path.resolve(__dirname, './public')));
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

// Port configuration & connecting to MongoDB
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
