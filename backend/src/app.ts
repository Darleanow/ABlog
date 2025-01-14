import { errorMiddleware } from "./middleware/error.middleware";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import articlesRoutes from "./routes/articles.routes";
import authRoutes from "./routes/auth.routes";
import commentsRoutes from "./routes/comments.routes";
import categoriesRoutes from "./routes/categories.routes";
import tagsRoutes from "./routes/tags.routes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/articles", articlesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/tags', tagsRoutes);
app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;
