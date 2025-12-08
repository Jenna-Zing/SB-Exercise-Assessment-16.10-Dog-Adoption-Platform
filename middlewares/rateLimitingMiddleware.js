import jwt from "jsonwebtoken";

// 1. create an in-memory storage map
const rateLimitMap = new Map();

export async function rateLimitingMiddleware(req, res, next) {
  // EXTRACT CURRENT USER FROM COOKIE
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required.  Please login." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid auth token.  Please login again." });
  }

  const userId = decoded.id;
  const now = Date.now() / 1000; // current time in seconds
  const cooldownSeconds = 3;

  const lastOperation = rateLimitMap.get(userId); // check if user record exists

  // NO PREVIOUS OPERATION -> ALLOW
  /* This means: either (1) user has NOT made a request recently, OR 
      (2) the timeout already deleted the record.  So this is the 
      **first request in a new cycle**, and thus, we allow the operation
       and save the timestamp and schedule a deletion after cooldown.
  */
  // 3. if no user record, create a record for the user with the current time.  Call next() to proceed.
  if (!lastOperation) {
    // this is the first operation, so we allow it
    rateLimitMap.set(userId, now);

    // clean up after cooldown period
    setTimeout(() => {
      rateLimitMap.delete(userId);
    }, cooldownSeconds * 1000);

    return next();
  }

  // 2. CHECK IF A USER RECORD EXISTS
  //    If a record exists for the user, it means we're still in cooldown -> BLOCK (send back a response, without next())
  //    -> response returns how much longer the user needs to wait

  // calculate time since last operation
  const timeSinceLastOperation = now - lastOperation;

  // the limiting part: check if enough time has passed...
  /* This means: The user DID make a request recently, but enough time has passed 
     and the cooldown has finished, so the next request should be allowed! 
     - IMPORTANT: even if **setTimeout** hasn't deleted the entry yet, we still allow the request since cooldown has been met.
  */
  // COOLDOWN FINISHED -> ALLOW
  if (timeSinceLastOperation >= cooldownSeconds) {
    // cooldown is over - allow operation
    rateLimitMap.set(userId, now);

    // set new cleanup timer
    setTimeout(() => {
      rateLimitMap.delete(userId);
    }, cooldownSeconds * 1000);

    return next();
  }

  // STILL IN COOLDOWN -> BLOCK OPERATION
  // This means:  there is an entry for the user and cooldown is NOT over yet, so we block it.  User is still within the forbidden window and must wait.
  const retryAfter = Math.ceil(cooldownSeconds - timeSinceLastOperation);
  return res.status(429).json({ error: "Too many requests", retryAfter });
}
