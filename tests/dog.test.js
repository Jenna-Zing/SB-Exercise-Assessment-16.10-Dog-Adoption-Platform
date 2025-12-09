import request from "supertest"; // allows making HTTP requests to our app in memory
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

import app from "../app.js"; // imports the configured Express app
import { connectTestDB, closeTestDB, clearDB } from "./setup.js"; // in-memory DB helpers
import { User } from "../models/User.js"; // User model for DB checks
import { Dog } from "../models/Dog.js"; // Dog model for DB checks
import bcrypt from "bcrypt";

const saltRounds = 10;
const ITEMS_PER_PAGE = 2;

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

describe("Dog Controller", () => {
  let userCookie;
  let userId;

  beforeEach(async () => {
    const hashed = await bcrypt.hash("mypassword", saltRounds);
    const user = await User.create({ username: "testuser", password: hashed });
    userId = user._id.toString();

    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "mypassword",
    });
    userCookie = res.headers["set-cookie"][0];
  });

  describe("Register Dog - POST /dogs/registerDog", () => {
    it("should register a dog successfully", async () => {
      const res = await request(app)
        .post("/dogs/registerDog")
        .set("Cookie", userCookie)
        .send({ name: "Pom", description: "A fluffy white pomeranian" });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain("Pom");
      const dog = await Dog.findOne({ name: "Pom" });
      expect(dog).not.toBeNull();
      expect(dog.originalOwnerId.toString()).toBe(userId);
    });

    it("should return 400 if name or description is missing", async () => {
      const res = await request(app)
        .post("/dogs/registerDog")
        .set("Cookie", userCookie)
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Name and description are required to register a dog."
      );
    });
  });

  describe("Adopt Dog - POST /dogs/adoptDog/:id", () => {
    let dogId;
    let adopterCookie;
    let adopterId;

    beforeEach(async () => {
      const dog = await Dog.create({
        name: "Buddy",
        description: "A golden retriever",
        originalOwnerId: userId,
        adopted: false,
      });
      dogId = dog._id.toString();

      // Create adopter user
      const hashed = await bcrypt.hash("pass2", saltRounds);
      const adopter = await User.create({
        username: "adopter",
        password: hashed,
      });
      adopterId = adopter._id.toString();

      const res = await request(app).post("/user/login").send({
        username: "adopter",
        password: "pass2",
      });
      adopterCookie = res.headers["set-cookie"][0];
    });

    it("Success Case: should allow a different user to adopt a dog", async () => {
      const res = await request(app)
        .post(`/dogs/adoptDog/${dogId}`)
        .set("Cookie", adopterCookie)
        .send({ message: "Thanks!" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Congratulations");
      const dog = await Dog.findById(dogId);
      expect(dog.adopted).toBe(true);
      expect(dog.currentOwnerId.toString()).toBe(adopterId);
    });

    it("Error Case: should return 404 if the dog does not exist", async () => {
      const fakeDogId = "649f5d0f1f1e3b0012345678"; // some valid ObjectId that is not in DB

      const res = await request(app)
        .post(`/dogs/adoptDog/${fakeDogId}`)
        .set("Cookie", adopterCookie)
        .send({ message: "Trying to adopt" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(`No dog with an id: ${fakeDogId} was found.`);
    });

    it("Error Case: should prevent original owner from adopting their own dog", async () => {
      const res = await request(app)
        .post(`/dogs/adoptDog/${dogId}`)
        .set("Cookie", userCookie)
        .send({ message: "Trying to adopt" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain(
        "cannot adopt a dog that you registered"
      );
    });

    it("Error Case: should prevent adoption if dog is already adopted", async () => {
      await Dog.findByIdAndUpdate(dogId, {
        adopted: true,
        currentOwnerId: adopterId,
      });

      const res = await request(app)
        .post(`/dogs/adoptDog/${dogId}`)
        .set("Cookie", adopterCookie)
        .send({ message: "Trying again" });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("already been adopted");
    });
  });

  describe("Remove Dog - DELETE /dogs/removeDog/:id", () => {
    let dogId;

    beforeEach(async () => {
      const dog = await Dog.create({
        name: "Max",
        description: "Dog to remove",
        originalOwnerId: userId,
        adopted: false,
      });
      dogId = dog._id.toString();
    });

    it("Success Case: should allow original owner to remove unadopted dog", async () => {
      const res = await request(app)
        .delete(`/dogs/removeDog/${dogId}`)
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      const dog = await Dog.findById(dogId);
      expect(dog).toBeNull();
    });

    it("Error Case: should return 404 if the dog does not exist", async () => {
      const fakeDogId = "649f5d0f1f1e3b0012345678"; // some valid ObjectId that is not in DB

      const res = await request(app)
        .delete(`/dogs/removeDog/${fakeDogId}`)
        .set("Cookie", userCookie)
        .send({ message: "Trying to remove dog" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(`No dog with an id: ${fakeDogId} was found.`);
    });

    it("Error Case: should prevent removal of *adopted* dog", async () => {
      await Dog.findByIdAndUpdate(dogId, { adopted: true });
      const res = await request(app)
        .delete(`/dogs/removeDog/${dogId}`)
        .set("Cookie", userCookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "You cannot remove a dog that has already been adopted!"
      );
    });

    it("Error Case: should prevent dog removal by users that aren't the original owner", async () => {
      const hashed = await bcrypt.hash("pass2", saltRounds);
      const other = await User.create({ username: "other", password: hashed });
      const resLogin = await request(app).post("/user/login").send({
        username: "other",
        password: "pass2",
      });
      const otherCookie = resLogin.headers["set-cookie"][0];

      const res = await request(app)
        .delete(`/dogs/removeDog/${dogId}`)
        .set("Cookie", otherCookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe(
        "You cannot remove a dog that was registered by another user."
      );
    });
  });

  describe("Get Registered Dogs - GET /dogs/registeredDogs", () => {
    beforeEach(async () => {
      await Dog.create([
        {
          name: "Fido",
          description: "A small black shepherd dog",
          originalOwnerId: userId,
          adopted: false,
        },
        {
          name: "Binx",
          description: "A big rottweiler",
          originalOwnerId: userId,
          adopted: true,
        },
        {
          name: "Alice",
          description: "A medium-sized chocolate labrador",
          originalOwnerId: userId,
          adopted: false,
        },
      ]);
    });

    it("should return paginated registered dogs", async () => {
      const pageNumber = 1;
      const res = await request(app)
        .get(`/dogs/registeredDogs?page=${pageNumber}`)
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.dogs.length).toBe(ITEMS_PER_PAGE);
    });

    it("should filter adopted dogs", async () => {
      const res = await request(app)
        .get("/dogs/registeredDogs?adopted=true")
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.dogs.every((d) => d.adopted)).toBe(true);
    });
  });

  describe("Get Adopted Dogs - GET /dogs/adoptedDogs", () => {
    let adopterId;
    let adopterCookie;

    beforeEach(async () => {
      const hashed = await bcrypt.hash("adopterpass", saltRounds);
      const adopter = await User.create({
        username: "adopter",
        password: hashed,
      });
      adopterId = adopter._id.toString();

      const res = await request(app).post("/user/login").send({
        username: "adopter",
        password: "adopterpass",
      });
      adopterCookie = res.headers["set-cookie"][0];

      await Dog.create([
        {
          name: "Fido",
          description: "A small black shepherd dog",
          originalOwnerId: userId,
          adopted: false,
        },
        {
          name: "Binx",
          description: "A big rottweiler",
          originalOwnerId: userId,
          adopted: true,
          currentOwnerId: adopterId,
        },
        {
          name: "Alice",
          description: "A medium-sized chocolate labrador",
          originalOwnerId: userId,
          adopted: true,
          currentOwnerId: adopterId,
        },
      ]);
    });

    it("should return paginated adopted dogs for the current user", async () => {
      const res = await request(app)
        .get("/dogs/adoptedDogs?page=1")
        .set("Cookie", adopterCookie);

      expect(res.status).toBe(200);
      expect(res.body.dogs.length).toBe(ITEMS_PER_PAGE);
      expect(res.body.dogs.every((d) => d.currentOwnerId === adopterId)).toBe(
        true
      );
    });
  });
});
