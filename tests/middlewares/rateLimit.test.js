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

describe("Rate Limiting Middleware", () => {
  let cookie;

  beforeEach(async () => {
    // Create a user and login to get JWT cookie -> RESULT: every test has a fresh authenticated user
    const hashed = await bcrypt.hash("mypassword", saltRounds);
    await User.create({ username: "testuser", password: hashed });

    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "mypassword",
    });
    cookie = res.headers["set-cookie"][0];
  });

  it("should allow first request but block second request within cooldown", async () => {
    // 1st request should succeed
    const res1 = await request(app)
      .post("/dogs/registerDog") // go to protected route in dogRoutes that uses authMiddleware
      .set("Cookie", cookie)
      .send({ name: "Pom", description: "A fluffy white pomeranian" });
    expect(res1.status).toBe(201); // or whatever your controller returns

    // 2nd request immediately should fail with 429 - due to calling again within 3 second cooldown without waiting
    const res2 = await request(app)
      .post("/dogs/registerDog") // go to protected route in dogRoutes that uses authMiddleware
      .set("Cookie", cookie)
      .send({ name: "Buddy", description: "A golden retriever" });
    expect(res2.status).toBe(429);
    expect(res2.body.error).toContain("Too many requests");
  });

  it("should allow request after cooldown expires", async () => {
    const cooldown = 3000; // 3 seconds as defined in middleware
    const res1 = await request(app)
      .post("/dogs/registerDog") // go to protected route in dogRoutes that uses authMiddleware
      .set("Cookie", cookie)
      .send({ name: "Rex", description: "A sleek doberman" });
    expect(res1.status).toBe(201);

    // Wait for cooldown
    await new Promise((r) => setTimeout(r, cooldown + 100)); // wait a bit longer

    // Next request should succeed
    const res2 = await request(app)
      .post("/dogs/registerDog") // go to protected route in dogRoutes that uses authMiddleware
      .set("Cookie", cookie)
      .send({ name: "Rex2", description: "Another dog" });
    expect(res2.status).toBe(201);
  });
});
