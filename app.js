import express from "express"; // load the express library
import cors from "cors"; // loads cors library - cross-origin resource sharing -> if FE and BE run on different ports, the browser considers them different "origins", so the browser will block the requests.
// with CORS, you allow your frontend (FE) to talk to your backend (BE) -> thus, your client (FE) can call the API endpoints in your server.  See the associated route for the BE code that handles that endpoint address.
import { connectDB } from "./db.js";

// ROUTERS
import { router as dogRoutes } from "./routes/dogRoutes.js"; // import the router
import { router as userRoutes } from "./routes/userRoutes.js";

const app = express(); // creates an express app (backend program), so I can define routes, middlewares, etc.

// 1. Connect to MongoDB database before anything else that can handle requests
await connectDB();

// 2. MIDDLEWARES
// adding middleware (code that runs *before* your route handler) to parse JSON in request bodies -> raw text gets converting to JS object and put into `req.body`
app.use(express.json());
// adding CORS middleware so the frontend can talk to the backend
app.use(cors()); // browser security policy, allowing frontend -> backend requests

// 3. ROUTES
// Mount the routers
app.use("/dogs", dogRoutes); // All dogRoutes are now prefixed with '/dogs'
app.use("/user", userRoutes); // All userRoutes are now prefixed with /user

// 4. Start the web server, so you can accept HTTP requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
