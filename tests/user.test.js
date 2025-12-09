import request from "supertest"; // allows making HTTP requests to our app in memory
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

import app from "../app.js"; // imports the configured Express app
import { connectTestDB, closeTestDB, clearDB } from "./setup.js"; // in-memory DB helpers
import { User } from "../models/User.js"; // User model for DB checks
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

// Describe a group of tests related to user registration
describe("User Registration - /user/register", () => {
  // Test 1: Missing username or password
  it("should fail if username or password missing", async () => {
    // Make POST request to /user/register with empty data
    const response = await request(app).post("/user/register").send({
      username: "",
      password: "",
    });

    // Expect a 400 Bad Request response
    expect(response.status).toBe(400);

    // Expect the response body to include the correct error message
    expect(response.body.error).toBe("Username and password are required.");
  });

  // Test 2: Username already exists -> error out
  it("should fail if username already exists", async () => {
    // First, create a user in the DB manually
    await User.create({ username: "testuser", password: "hashedpass" });

    // Attempt to register the same username again
    const response = await request(app).post("/user/register").send({
      username: "testuser",
      password: "newpassword",
    });

    // Expect 400 Bad Request
    expect(response.status).toBe(400);

    // Expect proper error message about duplicate username
    expect(response.body.error).toBe("Username already exists");
  });

  // Test 3: Successful user creation
  it("should create a new user with hashed password", async () => {
    // Make POST request to register a valid user
    const response = await request(app).post("/user/register").send({
      username: "testuser",
      password: "testpassword",
    });

    // Expect 201 for successful creation
    expect(response.status).toBe(201);

    // Expect response text to confirm registration
    expect(response.text).toBe("Successfully registered user");

    // Verify that user was actually created in DB
    const user = await User.findOne({ username: "testuser" });
    expect(user).not.toBeNull();

    // Verify that password is hashed and not stored as plain text
    expect(user.password).not.toBe("testpassword");
  });
});

describe("User Login - /user/login", () => {
  it("should fail if username or password is missing", async () => {
    const res = await request(app).post("/user/login").send({
      username: "",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Username and password are required.");
  });

  it("should fail if username does not exist", async () => {
    const res = await request(app).post("/user/login").send({
      username: "nonexistent",
      password: "anypassword",
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(
      "No such user found with username: nonexistent"
    );
  });

  it("should fail if password is incorrect", async () => {
    // First create a user in DB
    const hashed = await bcrypt.hash("correctpassword", saltRounds);
    await User.create({ username: "testuser", password: hashed });

    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid password");
  });

  it("should log in successfully with correct credentials and issue JWT cookie", async () => {
    const hashed = await bcrypt.hash("mypassword", saltRounds);
    await User.create({ username: "testuser", password: hashed });

    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "mypassword",
    });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Login successful");

    // Check that a cookie called 'jwt' is set
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("jwt=");
  });
});
