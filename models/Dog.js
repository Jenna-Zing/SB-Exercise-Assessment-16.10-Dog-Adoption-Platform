import { Schema, model } from "mongoose";

const dogSchema = new Schema(
  {
    // MongoDB generates a unique _id for each document
    name: {
      type: String,
      required: true, // every dog must have a name
    },
    description: {
      type: String,
      required: true, // every dog must have a description
    },
    originalOwnerId: {
      type: String, // user ID wo initially registered the dog
      required: true,
    },
    msgForOriginalOwner: {
      type: String, // optional thank-you message -> filled in at adoption time
      required: false,
      default: null, // when a dog is adopted, if not supplied, default to empty
    },
    currentOwnerId: {
      type: String, // the current owner (null if up for adoption)
      default: null, // adopter user ID -> only assigned after adoption
    },
    adopted: {
      type: Boolean,
      default: false, // dogs are not adopted by default
    },
  },
  {
    timestamps: true,
  }
);

// third argument => specifies collection name (aka table name) in MongoDB
export const Dog = model("Dog", dogSchema, "dog");
