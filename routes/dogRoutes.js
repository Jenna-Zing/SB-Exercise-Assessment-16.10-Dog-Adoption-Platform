import express from "express"; // imports Express library
export const router = express.Router(); // Creates a new Router instance
// Router = sub-app for your Express app for handling a group of routes, and lets you organize routes in separate files (e.g. group related endpoints like dog-related ones together)!

// import your dogController!
import * as dogController from "../controllers/dogController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { rateLimitingMiddleware } from "../middlewares/rateLimitingMiddleware.js";

// Define routes (endpoints + method + controller)
router.post(
  "/registerDog",
  authenticate,
  rateLimitingMiddleware,
  dogController.registerDog
);
router.post(
  "/adoptDog/:id",
  authenticate,
  rateLimitingMiddleware,
  dogController.adoptDog
); // ".../adoptDog/420jfdlajf"
router.delete(
  "/removeDog/:id",
  authenticate,
  rateLimitingMiddleware,
  dogController.removeDog
); // "...removeDog/420jfdlajf"

router.get(
  "/registeredDogs",
  authenticate,
  rateLimitingMiddleware,
  dogController.getRegisteredDogs
); // ".../registeredDogs?page=1"
router.get(
  "/adoptedDogs",
  authenticate,
  rateLimitingMiddleware,
  dogController.getAdoptedDogs
); // ".../adoptedDogs?page=1"
