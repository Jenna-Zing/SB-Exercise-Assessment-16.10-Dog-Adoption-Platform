// Replace this file with the logic for handling incoming requests and returning responses to the client
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

// function that contains the *logic* for what the endpoint should do.

// 1. User Registration: Allow users to register with a username and password. Passwords should be hashed before storing in the database.
export async function registerUser(req, res) {
  try {
    const { username, password } = req.body;
    console.log(`${username}, ${password}`);

    // Validate required fields - if undefined or null, and not empty string, return error
    if (!username?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

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
    res.cookie("jwt", token, { httpOnly: true });
    res.status(201).send("Successfully registered user");
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
}

// 2. User Authentication: Enable users to log in using their credentials. Upon login, issue a token valid for 24 hours for subsequent authenticated requests.
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    console.log(`${username}, ${password}`);

    // Validate required fields - if undefined or null, and not empty string, return error
    if (!username?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    // Find the user record in the DB
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res
        .status(404)
        .json({ error: `No such user found with username: ${username}` });
    }

    // Compare the inputted password with the stored hash
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // if password is correct -> sign them in and allocate JWT
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log(`token: ${token}`);

    // send token to the client
    res.cookie("jwt", token, { httpOnly: true });
    res.status(200).send("Login successful");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
