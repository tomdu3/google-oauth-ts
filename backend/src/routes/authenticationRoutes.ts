import express from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middleware/jwt'; // Assuming JWT logic is here
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
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken) as JwtPayload;

    if (!decoded.id) {
      return res.status(403).json({ error: 'Invalid token structure' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id);

    // Optionally: rotate the refresh token
    const newRefreshToken = generateRefreshToken(decoded.id);

    // Set the new tokens in cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: 'strict',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });

    // Return the new access token to the client
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout Route (clears both access and refresh tokens)
router.get('/logout', (req: Request, res: Response) => {
  // Clear the cookies
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Optionally, redirect to the homepage or a login page
  res.json({ message: 'Logged out successfully' });
});

export default router;
