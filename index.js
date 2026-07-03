import express from "express";
import db from "./models/index.js";
import env from './config/env.js';
import authRouter from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from './routes/postRoutes.js';
import { postCommentsRouter, commentRouter } from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import logger from "./middlewares/logger.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const PORT = env.PORT;

try {
  await db.sequelize.authenticate();
  console.log("Connected to PostgreSQL");
} catch (err) {
  console.error("Connection failed:", err);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//Register Logger
app.use(logger);

//ROUTES
app.use("/api/auth", authRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', postCommentsRouter);
app.use('/api/posts/:postId', likeRoutes);       // → /api/posts/:postId/like, /api/posts/:postId/likes
app.use('/api/comments', commentRouter);
app.use('/api/notifications', notificationRoutes);
//Handle 404 Not Found
app.use(notFound);

//Register Error Handl  er
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});