import { login, register } from '../controllers/authenticationControllers';
import express from 'express';
import passport from 'passport';
import { generateToken } from '../middleware/jwt'; // JWT generation logic

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/',  session: false }),
    (req, res) => {
      if (req.user) {
        const token = generateToken((req.user as any).id);
  
        // Set the JWT as a cookie
        res.cookie('auth_token', token, {
          httpOnly: true, // To prevent client-side scripts from accessing the cookie
          secure: process.env.NODE_ENV === 'production', // Send the cookie only over HTTPS
          maxAge: 3600000, // 1 hour expiration
          sameSite: 'strict', // Prevent CSRF attacks
        });
  
        // Redirect or respond with success
        res.redirect('/');
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  );

  router.get('/logout', (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  });
  
export default router;
