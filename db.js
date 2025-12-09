/* 
  DB.JS - Connects to the database
  - handles the database connection
  - can be called from either `server.js` or tests..
  - reads connection info from process.env (using dotenv -> relies on `app.js` or `tests` to call them before it runs)
*/

import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error: ", err);
  }
}
