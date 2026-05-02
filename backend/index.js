import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import userRoutes from './routes/user.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Update according to your frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy', uptime: process.uptime() });
});

// Proper Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
