import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "./postgres.js";

passport.use(
  new GoogleStrategy(
    {
      // Options for the Google strategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // Must match the one in Google Cloud Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // This callback runs after a user signs in.
      // It finds or creates a user in our database.
      console.log("Passport callback function fired:", profile);

      const googleId = profile.id;
      const displayName = profile.displayName;
      const email = profile.emails[0].value;

      try {
        // Check if the user already exists in our database
        const findUserQuery = "SELECT * FROM users WHERE google_id = $1";
        const { rows: existingUsers } = await pool.query(findUserQuery, [googleId]);

        if (existingUsers.length > 0) {
          // User already exists
          console.log("User already exists:", existingUsers[0]);
          return done(null, existingUsers[0]); // Pass the existing user to the next step
        } else {
          // User does not exist, create a new one
          const insertUserQuery =
            "INSERT INTO users (google_id, display_name, email) VALUES ($1, $2, $3) RETURNING *";
          const { rows: newUsers } = await pool.query(insertUserQuery, [
            googleId,
            displayName,
            email,
          ]);
          console.log("Created new user:", newUsers[0]);
          return done(null, newUsers[0]); // Pass the newly created user
        }
      } catch (err) {
        console.error("Error with database query:", err);
        return done(err, null);
      }
    }
  )
);

