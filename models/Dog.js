import { Schema, model } from "mongoose";

const dogSchema = new Schema(
  {
    id: String,
    name: String,
    description: String,
    registeredUserId: String,
    originalOwnerMsg: String,
    ownerUserId: String,
    adopted: Boolean,
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

const Dog = model("Dog", dogSchema);
export default Dog;
