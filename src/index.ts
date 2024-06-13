import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import { dbConnection } from "./libs/db";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import { cloudinaryConfig, limiter } from "./configs/app-config";
import { errorHandler } from "./middlewares/error-handler";

// Import routers
import { projectRouters } from "./routes/projects";
import { authRouters } from "./routes/auth";
import { commentRouters } from "./routes/comments";
import { likeRouters } from "./routes/likes";

dbConnection(); // Database connection

const app = express();
const port = process.env.PORT || 3000;

// Proxy
app.set("trust proxy", 1 /* number of proxies between user and server */);

// Middlewares
app.use(helmet());
app.use(cors({ credentials: true, origin: ["http://localhost:5173"] }));
app.use(limiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
cloudinary.config(cloudinaryConfig);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world!" });
});

// Routes handlers
app.use("/project", projectRouters);
app.use("/auth", authRouters);
app.use("/comment", commentRouters);
app.use("/like", likeRouters);

// error handlers
app.use(errorHandler);

// Listening port
app.listen(port, () => {
  console.log(`listening on: http://localhost:${port}`);
});
