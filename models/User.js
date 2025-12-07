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
    /* 
      id string [primary key, note: 'could be auto-increment id, or uuid generated on insert']
      username string
      password string
    */
  },
  {
    timestamps: true,
  }
);

// third argument => specifies collection name (aka table name) in MongoDB
export const User = model("User", userSchema, "user");
