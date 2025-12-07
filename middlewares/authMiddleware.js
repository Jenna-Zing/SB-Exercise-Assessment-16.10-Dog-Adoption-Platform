// Replace this file with custom middleware functions, including authentication and rate limiting

import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

// middleware = functions/code that run *before* your route runs.
// A request comes in -> middleware does something -> your route runs -> a response is sent back.
// Think of middleware like checkpoints..

/* ASK:  What are the best things to put in a authMiddleware by convention?
e.g. data validation , password salting, checking if username exists, etc. */

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required.  Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find the user in the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user; // attach user to request
    next(); // continue to the controller
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Authentication failed!" });
  }
}
