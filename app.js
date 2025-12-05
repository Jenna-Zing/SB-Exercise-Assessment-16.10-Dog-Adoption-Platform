const express = require("express"); // load the express library
const cors = require("cors"); // loads cors library - cross-origin resource sharing -> if FE and BE run on different ports, the browser considers them different "origins", so the browser will block the requests.
// with CORS, you allow your frontend (FE) to talk to your backend (BE) -> thus, your client (FE) can call the API endpoints in your server.  See the associated route for the BE code that handles that endpoint address.
const dogRoutes = require("./routes/dogRoutes"); // import the router

const app = express(); // creates an express app (backend program), so I can define routes, middlewares, etc.

// adding middleware (code that runs *before* your route handler) to parse JSON in request bodies -> raw text gets converting to JS object and put into `req.body`
app.use(express.json());

// adding CORS middleware so the frontend can talk to the backend
app.use(cors()); // browser security policy, allowing frontend -> backend requests

// Mount the routers
app.use("/dogs", dogRoutes); // All dogRoutes are now prefixed with '/dogs'

// Start the web server, so you can accept HTTP requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
