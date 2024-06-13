import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 20000,
      maxPoolSize: 5,
    });
    console.log("Connected to MongoDB...");
  } catch (error) {
    console.log(error);
    process.exit();
  }
};
