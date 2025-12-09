import jwt from "jsonwebtoken";

// 1. create an in-memory storage map
const rateLimitMap = new Map();

export async function rateLimitingMiddleware(req, res, next) {
  // 2. EXTRACT JWT TOKEN FROM THE COOKIE
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required.  Please login." });
  }

  // 2. VERIFY THE TOKEN AND EXTRACT THE CURRENT USER ID
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid auth token.  Please login again." });
  }

  const userId = decoded.id; // this is the currently logged in user id
  const now = Date.now() / 1000; // current time in seconds
  const cooldownSeconds = 3;

  // Check the map
  //  If userId exists
  //      -> check the user record -> extract value (timestamp) and compare it to NOW()
  //      -> if diff: NOW() - timestamp >= cooldown -> delete user record from map + next() to allow them through (SKIPPED)
  //      -> if diff: NOW() - timestamp < cooldown -> user still in cooldown, block with res
  //  if userId does NOT exist
  //      -> insert user record and setTimeout to delete the record
  //      -> next() to allow them through

  const lastOperation = rateLimitMap.get(userId);

  // 3. No previous entry -> allow and set new cooldown timer
  if (!lastOperation) {
    rateLimitMap.set(userId, now);

    setTimeout(() => {
      rateLimitMap.delete(userId);
    }, cooldownSeconds * 1000); // delete user record after cooldown ends

    return next();
  }

  // 4. Still in cooldown -> block
  return res
    .status(429)
    .json({
      error: `Too many requests.  Retry after ${cooldownSeconds} seconds.`,
    });
}
