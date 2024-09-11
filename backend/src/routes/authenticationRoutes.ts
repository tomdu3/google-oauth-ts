import { login, register } from '../controllers/authenticationControllers';
import express from 'express';
import passport from 'passport';
import { generateToken } from '../middleware/jwt'; // JWT generation logic
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req, res) => {
    if (req.user) {
      const token = generateToken((req.user as any).id);
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'strict',
      });
      res.redirect('/');
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
);

// error handler
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

  router.get('/logout', (req, res) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  });
  
export default router;
