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

export async function getRegisteredDogs(req, res) {
  const pageNumber = req.query.page;
  const ITEMS_PER_PAGE = 2;
  console.log(pageNumber);

  // calculate offset based on page number and item limit
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;

  const dogs = await Dog.find().skip(offset).limit(ITEMS_PER_PAGE);
  console.log(dogs);

  res.status(200).send(dogs);
}
