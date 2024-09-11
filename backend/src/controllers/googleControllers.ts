import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, displayName } = profile;

        // Handle finding or creating user in your database
        let user = await prisma.user.findUnique({ where: { googleId: id } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: id,
              email: emails?.[0].value || '',
              name: displayName,
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error); // Handle errors without crashing
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  done(null, user);
});
