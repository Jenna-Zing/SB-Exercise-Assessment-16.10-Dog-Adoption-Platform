/* Tests/setup.js - in-memory DB: prevents tests from touching the REAL MongoDB, this data is just temporary */

import { MongoMemoryServer } from "mongodb-memory-server"; // spins up a temporary MongoDB instance in memory
import mongoose from "mongoose"; // Mongoose for DB interactions
import dotenv from "dotenv";

dotenv.config(); // load any env vars needed for JWT_SECRET etc.

let mongoServer; // will hold the in-memory MongoDB instance

// Connect to the in-memory MongoDB before tests
export async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create(); // creates in-memory MongoDB
  const uri = mongoServer.getUri(); // gets the connection string

  await mongoose.connect(uri); // connect Mongoose to the in-memory DB
  console.log("Connected to in-memory MongoDB");
}

// Disconnect and stop the in-memory MongoDB after all tests
export async function closeTestDB() {
  await mongoose.disconnect(); // disconnect Mongoose
  await mongoServer.stop(); // stops in-memory MongoDB
}

// Clear all collections between tests so tests are **isolated** / don't touch each other
export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({}); // delete all documents in each collection
  }
}
