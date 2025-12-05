const express = require("express"); // load the express library
const app = express(); // creates an express app (backend program), so I can define routes, middlewares, etc.

// A basic route for sample API endpoint (just logging route works)
app.get("/", (req, res) => {
  res.send("Dog Adoption API is running");
});

// Start the web server, so you can accept HTTP requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
