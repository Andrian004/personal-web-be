import rateLimit from "express-rate-limit";
import multer from "multer";

// express rate limit
export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per window (here, per minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

// multer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1 MB
  },
});

// cloudinary
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
