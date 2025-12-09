/*  
  APP.JS - defines the express app
  - creates and configures the Express app
  - Adds *Middlewares and *routes
  - does NOT start the web server
  - can be imported by tests for in-memory/integration tests (e.g. Supertest)
  -> RESULT:  tells Express how to handle requests, allowing tests to import `app` and run requests in memory without starting a server
  -> **NOTE:  Tests do NOT import server.js, they only import app to avoid port conflicts and running tests in memory.  Server.js is used to launch the app.
*/

import express from "express"; // load the express library
import cors from "cors"; // loads cors library - cross-origin resource sharing -> if FE and BE run on different ports, the browser considers them different "origins", so the browser will block the requests.
// with CORS, you allow your frontend (FE) to talk to your backend (BE) -> thus, your client (FE) can call the API endpoints in your server.  See the associated route for the BE code that handles that endpoint address.
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
dotenv.config(); // allows you to use .env variables

// ROUTERS
import { router as dogRoutes } from "./routes/dogRoutes.js"; // import the router
import { router as userRoutes } from "./routes/userRoutes.js";

const app = express(); // creates an express app (backend program), so I can define routes, middlewares, etc.

// 2. MIDDLEWARES
// adding middleware (code that runs *before* your route handler) to parse JSON in request bodies -> raw text gets converting to JS object and put into `req.body`
app.use(express.json());
// adding CORS middleware so the frontend can talk to the backend
app.use(cors()); // browser security policy, allowing frontend -> backend requests
// adding middleware for express to parse cookies -> cookies available through req.cookies
app.use(cookieParser());

// 3. ROUTES
// Mount the routers
app.use("/dogs", dogRoutes); // All dogRoutes are now prefixed with '/dogs'
app.use("/user", userRoutes); // All userRoutes are now prefixed with /user

// For integration testing with "supertest", supertest wants the express app ONLY and creates its own internal server for testing (so I set the express server starting in server.js!)
export default app;
