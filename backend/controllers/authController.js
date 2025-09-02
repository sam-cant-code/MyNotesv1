import jwt from "jsonwebtoken";

// This function contains the logic for the /auth/google/callback route
export const googleCallback = (req, res) => {
  const payload = {
    id: req.user.id,
    googleId: req.user.google_id,
    email: req.user.email,
    displayName: req.user.display_name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Redirect to the React app's callback route with the token
  res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
};