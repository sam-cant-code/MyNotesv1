import jwt from "jsonwebtoken";

// This function contains the logic for the /auth/google/callback route
export const googleCallback = (req, res) => {
  // At this point, the passport callback in passport-setup.js has completed.
  // The user profile (found or created) is attached to req.user.

  // We create a JWT (JSON Web Token) for the user.
  const payload = {
    id: req.user.id,
    googleId: req.user.google_id,
    email: req.user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h", // The token will expire in one hour
  });

  // We send the token and user info back to the client.
  // In a real front-end application, you would typically redirect the user
  // to a specific page and include the token, e.g.,
  // res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  res.status(200).json({
    message: "Successfully authenticated!",
    user: req.user,
    token: token,
  });
};
