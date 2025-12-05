const express = require("express"); // imports Express library
const router = express.Router(); // Creates a new Router instance
// Router = sub-app for your Express app for handling a group of routes, and lets you organize routes in separate files (e.g. group related endpoints like dog-related ones together)!

// import your dogController!
const dogController = require("../controllers/dogController");

// Define routes (endpoints + method + controller)
router.get("/", dogController.getDogs); // e.g. GET /dogs

module.exports = router; // Export the router so it can be used in app.js
