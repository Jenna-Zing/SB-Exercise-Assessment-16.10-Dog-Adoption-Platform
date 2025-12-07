// Replace this file with the logic for handling incoming requests and returning responses to the client

// function that contains the *logic* for what the endpoint should do.

export function getDogs(req, res) {
  const dogs = [
    { id: 1, name: "Buddy", age: 2, breed: "Labrador" },
    { id: 2, name: "Dolly", age: 3, breed: "Poodle" },
  ];

  res.json(dogs); // send the JSON response
}
