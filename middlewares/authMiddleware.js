// Replace this file with custom middleware functions, including authentication and rate limiting

import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

// middleware = functions/code that run *before* your route runs.
// A request comes in -> middleware does something -> your route runs -> a response is sent back.
// Think of middleware like checkpoints..

/* ASK:  What are the best things to put in a authMiddleware by convention?
e.g. data validation , password salting, checking if username exists, etc. */

// ENSURES A USER IS LOGGED IN AND HAS THE COOKIE WITH JWT FROM LOGIN
export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication required.  Please login." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    console.log(req.userId);
    next(); // continue to the controller
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Authentication failed!" });
  }
}
