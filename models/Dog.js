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
    registeredUserId: {
      type: String, // user ID wo initially registered the dog
      required: true,
    },
    originalOwnerMsg: {
      type: String, // optional thank-you message -> filled in at adoption time
      default: "", // when a dog is adopted, if not supplied, default to empty
    },
    ownerUserId: {
      type: String, // the current owner (null if up for adoption)
      default: null, // adopter user ID -> only assigned after adoption
    },
    adopted: {
      type: Boolean,
      default: false, // dogs are not adopted by default
    },
    /* 
  id string // primary key for dog
  name string
  description string
  originalOwnerMsg string // when adopted, show this to the registerUserId (aka OG owner)
  registeredUserId string // who registered the dog
  ownerUserId string // link to the user.id - by default: null for REGISTER, adopt => user.id
  adopted boolean // in the controller, set this to false in REGISTER.  True in Adopt.
 */
  },
  {
    timestamps: true,
  }
);

// third argument => specifies collection name (aka table name) in MongoDB
export const Dog = model("Dog", dogSchema, "dog");
