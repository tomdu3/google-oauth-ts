import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../middleware/jwt';
import { JwtPayload } from 'jsonwebtoken';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  // Check if access token exists
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    // Verify access token
    const decodedAccess = verifyAccessToken(accessToken) as JwtPayload;
    (req as any).user = decodedAccess; // Attach user info to request object
    next();
  } catch (err) {
    // If access token is expired or invalid, try refreshing it
    if (!refreshToken) {
      return res.status(401).json({ error: 'Access denied. No valid tokens' });
    }

    try {
      // Verify refresh token and explicitly cast to JwtPayload
      const decodedRefresh = verifyRefreshToken(refreshToken) as JwtPayload;

      if (typeof decodedRefresh === 'object' && decodedRefresh.id) {
        // Generate new tokens
        const newAccessToken = generateAccessToken(decodedRefresh.id);
        const newRefreshToken = generateRefreshToken(decodedRefresh.id);

        // Set new tokens as cookies
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

        // Continue to the protected route
        (req as any).user = decodedRefresh;
        next();
      } else {
        return res.status(403).json({ error: 'Invalid refresh token structure' });
      }
    } catch (err) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
  }
};
