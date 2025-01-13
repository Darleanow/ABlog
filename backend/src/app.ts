import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (uncomment as you implement them)
// app.use('/api/auth', authRoutes);
// app.use('/api/users', usersRoutes);
// app.use('/api/articles', articlesRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/tags', tagsRoutes);
// app.use('/api/comments', commentsRoutes);

// Error handling middleware
// app.use(errorMiddleware);

export default app;