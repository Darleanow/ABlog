import { errorMiddleware } from './middleware/error.middleware';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRoutes from './routes/articles.routes';
import commentsRoutes from "./routes/comments.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/articles', articlesRoutes);
app.use('/api/comments', commentsRoutes);

app.use(errorMiddleware);

export default app;