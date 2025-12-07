import express from "express"; // imports Express library
export const router = express.Router(); // Creates a new Router instance
// Router = sub-app for your Express app for handling a group of routes, and lets you organize routes in separate files (e.g. group related endpoints like dog-related ones together)!

import * as userController from "../controllers/userController.js";

// Define routes (endpoints + method + controller)
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
// router.get("/", userController.getDogs); // e.g. GET /dogs
