import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Routes
// import authRoutes from './routes/auth.routes';
// import usersRoutes from './routes/users.routes';
// import articlesRoutes from './routes/articles.routes';
// import categoriesRoutes from './routes/categories.routes';
// import tagsRoutes from './routes/tags.routes';
// import commentsRoutes from './routes/comments.routes';

// Middleware
// import { errorMiddleware } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Database configuration
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development', // Auto-create database tables in development
  logging: process.env.NODE_ENV === 'development',
  entities: ["src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/articles', articlesRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/tags', tagsRoutes);
// app.use('/api/comments', commentsRoutes);

// Error handling
// app.use(errorMiddleware);

// Export app for server.ts
export default app;
