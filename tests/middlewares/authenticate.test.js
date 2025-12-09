import request from "supertest"; // allows making HTTP requests to our app in memory
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

import app from "../../app.js"; // imports the configured Express app
import { connectTestDB, closeTestDB, clearDB } from "../setup.js"; // in-memory DB helpers
import { User } from "../../models/User.js"; // User model for DB checks
import bcrypt from "bcrypt";

const saltRounds = 10;

// Before all tests, connect to in-memory MongoDB
beforeAll(async () => {
  await connectTestDB();
});

// After all tests, disconnect and stop the in-memory MongoDB
afterAll(async () => {
  await closeTestDB();
});

// Before each test, clear the database to start fresh
beforeEach(async () => {
  await clearDB();
});

describe("Authenticate Middleware", () => {
  let cookie;

  beforeEach(async () => {
    // Create a test user
    const hashed = await bcrypt.hash("mypassword", saltRounds);
    await User.create({ username: "testuser", password: hashed });

    // Login to get JWT cookie
    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "mypassword",
    });
    cookie = res.headers["set-cookie"][0]; // get JWT cookie to simulate authenticated user (BUT DON'T STORE IT)
  });

  it("should block requests without JWT", async () => {
    const res = await request(app).get("/dogs/registeredDogs"); // go to protected route in dogRoutes that uses authMiddleware
    // Send a GET request **WITHOUT** the cookie.  authMiddleware checks for req.cookies.jwt -> missing -> response with 401 and msg

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required.  Please login.");
  });

  it("should allow requests with valid JWT", async () => {
    const res = await request(app)
      .get("/dogs/registeredDogs") // go to protected route in dogRoutes that uses authMiddleware
      .set("Cookie", cookie); // attach the previously stored JWT cookie
    // now authenticate middleware runs and allows route to proceed
    // assert that req passes authentication so it's a status 200
    expect(res.status).toBe(200);
  });
});
