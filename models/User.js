import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
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

export const User = model("User", userSchema);
export default User;
