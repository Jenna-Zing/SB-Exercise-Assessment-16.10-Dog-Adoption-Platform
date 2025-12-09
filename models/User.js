import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    // MongoDB generates a unique _id for each document
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// third argument => specifies collection name (aka table name) in MongoDB
export const User = model("User", userSchema, "user");
