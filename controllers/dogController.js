// Replace this file with the logic for handling incoming requests and returning responses to the client

import { Dog } from "../models/Dog.js";

// function that contains the *logic* for what the endpoint should do.

export function getDogs(req, res) {
  const dogs = [
    { id: 1, name: "Buddy", age: 2, breed: "Labrador" },
    { id: 2, name: "Dolly", age: 3, breed: "Poodle" },
  ];

  res.json(dogs); // send the JSON response
}

// 3. Dog Registration: Authenticated users can register dogs awaiting adoption, providing a name and a brief description.
export async function registerDog(req, res) {
  const { name, description } = req.body;

  try {
    // validate required fields
    if (!name || !description) {
      return res.status(400).json({
        error: "Name and description are required to register a dog.",
      });
    }

    // Create a dog record
    const dog = await Dog.create({
      name,
      description,
      registeredUserId: req.user._id, // logged-in user ID
      originalOwnerMsg: null, // the adopter will supply this for the person who registered the dog
      ownerUserId: null, // null because dog is not adopted yet
      adopted: false,
    });

    res.status(201).json({
      message: `A dog named ${name} was registered successfully!`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// 6. Listing Registered Dogs: Authenticated users can list dogs they've registered, with support for filtering by status and pagination.
export async function getRegisteredDogs(req, res) {
  try {
    // get user ID from your authentication middleware - for filtering
    const userId = req.user._id;

    // pagination defaults - optional query parameter (e.g. ".../registeredDogs?page=1")
    const pageNumber = Number(req.query.page) || 1; // defaults to page 1
    const ITEMS_PER_PAGE = 2;
    console.log(pageNumber);

    // calculate offset based on page number and item limit
    const offset = (pageNumber - 1) * ITEMS_PER_PAGE;

    // FILTERING
    const filter = { registeredUserId: userId }; // only this user's registered dogs

    // add adopted filter ONLY if provided
    const adoptedQuery = req.query.adopted;
    if (adoptedQuery !== undefined) {
      if (adoptedQuery !== "true" && adoptedQuery !== "false") {
        return res
          .status(400)
          .json({ error: "Invalid adopted value.  Use true or false." });
      }

      filter.adopted = adoptedQuery === "true"; // converts string to boolean
    }

    // fetch dogs
    const dogs = await Dog.find(filter).skip(offset).limit(ITEMS_PER_PAGE);
    console.log(dogs);

    res.status(200).send({ page: pageNumber, dogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
