/*
  SERVER.JS - STARTS THE WEB SERVER 
  - this is the entry point for running the app!  Do `npm run dev`
  - connects to the database, then starts the web server  
*/

import dotenv from "dotenv";
dotenv.config(); // allows you to use .env variables

import app from "./app.js";
import { connectDB } from "./db.js";

// 1. Connect to MongoDB database before anything else that can handle requests
await connectDB();

// 3. Start the web server, so you can accept HTTP requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
