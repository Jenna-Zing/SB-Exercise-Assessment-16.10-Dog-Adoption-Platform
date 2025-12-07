// Replace this file with the logic for handling incoming requests and returning responses to the client
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

// function that contains the *logic* for what the endpoint should do.

export async function registerUser(req, res) {
  const { username, password } = req.body;
  console.log(`${username}, ${password}`);

  try {
    // if username already exists -> error out
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`hashed ${hashedPassword}`);

    // create the user
    const user = await User.create({ username, password: hashedPassword });

    // create sign-up token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log(`token: ${token}`);

    // setup cookie middleware
    res.cookie("jwt", token);
    res.status(201).send("Successfully registered user");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
}

// #2
export function loginUser(req, res) {
  const { username, password } = req.body;

  // get user record from DB using the username
  // SELECT * FROM USER WHERE USER.USERNAME = username

  // decrypt the DB password using middleware -> to get raw PW back

  // if raw PW does not match the supplied login PW, ERROR
  // if it does match, let them in + issue JWT token valid for 24 hours
}
