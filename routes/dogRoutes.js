import express from "express"; // imports Express library
export const router = express.Router(); // Creates a new Router instance
// Router = sub-app for your Express app for handling a group of routes, and lets you organize routes in separate files (e.g. group related endpoints like dog-related ones together)!

// import your dogController!
import * as dogController from "../controllers/dogController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

// Define routes (endpoints + method + controller)
router.get("/", dogController.getDogs); // e.g. GET /dogs
router.post("/registerDog", authenticate, dogController.registerDog);
router.get("/registeredDogs", authenticate, dogController.getRegisteredDogs); // ".../registeredDogs?page=1"
