import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // allows you to use .env variables

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error: ", err);
  }
}
