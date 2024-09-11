import express from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/jwt'; // Assuming you have JWT logic here
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  (req, res) => {
    if (req.user) {
      const accessToken = generateAccessToken((req.user as any).id);
      const refreshToken = generateRefreshToken((req.user as any).id);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour for access token
        sameSite: 'strict',
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
        sameSite: 'strict',
      });

      res.redirect('/');
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
);

// Refresh Token Route
router.post('/refresh-token', (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token found' });
  }

  try {
    // Cast the decoded token to JwtPayload
    const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

    if (!decoded.id) {
      return res.status(403).json({ error: 'Invalid token structure' });
    }

    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id); // Optionally rotate refresh tokens

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour for access token
      sameSite: 'strict',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
      sameSite: 'strict',
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
