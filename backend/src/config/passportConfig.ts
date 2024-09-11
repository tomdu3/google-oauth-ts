import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback', // Make sure this matches your routes
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user data from profile
      // Example: find or create the user in the database
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        // other fields if necessary
      };

      // Pass the user data to the next middleware
      return done(null, user);
    }
  )
);

// Serialize and deserialize user (optional depending on how you're handling sessions)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  // Find user by ID in your database and return it
  const user = { id }; // Dummy example, replace with real user lookup logic
  done(null, user);
});
