# SB-Exercise-Assessment-16.10-Dog-Adoption-Platform

Springboard SE Bootcamp - Assessment Exercise - 16.10 Dog Adoption Platform

The folder structure designed by our software architects ensures adherence to best practices:

- `controllers`: Contains the logic for handling incoming requests and returning responses to the client.
- `models`: Defines the data models and interacts directly with the database.
- `routes`: Manages the routes of your API, directing requests to the appropriate controller.
- `middlewares`: Houses custom middleware functions, including authentication and rate limiting.
- `.env`: Stores environment variables, such as database connection strings and the JWT secret.
- `app.js`: The main entry point of your application, where you configure the Express app and connect all the pieces.
- `db.js`: Manages the database connection.
- `package.json`: Keeps track of npm packages and scripts necessary for your project.

This structure provides a solid foundation for building a well-organized, scalable backend service. By separating concerns into dedicated directories and files, your project remains clean, navigable, and easier to debug and extend.

View the rubric for this assessment [here](https://storage.googleapis.com/hatchways.appspot.com/employers/springboard/student_rubrics/Dog%20Adoption%20Platform%20Rubric.pdf)

---

Visual Diagram:
Client calls → GET /dogs ← (endpoint)
|
Express sees the request
|
Route says: “for GET /dogs, run getDogs” ← (route)
|
Controller runs the logic ← (controller)
|
Response returned to client

... or TLDR:
OR, super simple:

- Endpoint = the URL the client hits
- Route = the Express connection between URL + function
- Controller = the function that handles the request

---

Connecting it all together:

1. **`app.js`** -> main entry point, sets up express server for HTTP requests and mounts routers.
2. **Router** -> groups related endpoints (like `/dogs`).
3. **Controller** -> handles the actual logic for the endpoint
4. **Middleware** (e.g. `cors`, `express.json`) -> runs before routes, prepares request/response.
5. **Testing** -> doesn't require a frontend... browsers, Postman, Insomnia, or curl can work.

- ![alt text](browser-test.png)
- ![alt text](postman-test.png)
