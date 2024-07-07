import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import { cloudinaryConfig, limiter, logFormat } from "./configs/app-config";
import { errorHandler } from "./middlewares/error-handler";

// Import routers
import { userRouters } from "./routes/user";
import { projectRouters } from "./routes/projects";
import { authRouters } from "./routes/auth";
import { commentRouters } from "./routes/comments";
import { likeRouters } from "./routes/likes";

const app = express();

// Proxy
app.set("trust proxy", 1 /* number of proxies between user and server */);

// Middlewares
app.use(morgan(logFormat));
app.use(helmet());
app.use(cors({ credentials: true, origin: ["https://andriaja.vercel.app"] }));
app.use(limiter);
app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
cloudinary.config(cloudinaryConfig);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world!" });
});

// Routes handlers
app.use("/user", userRouters);
app.use("/project", projectRouters);
app.use("/auth", authRouters);
app.use("/comment", commentRouters);
app.use("/like", likeRouters);

// error handlers
app.use(errorHandler);

export default app;
