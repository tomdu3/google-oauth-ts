import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt'; // Your JWT verification logic

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth_token; // Access the token from the cookie

  if (!token) {
    return res.status(401).json({ error: 'No authentication token found' });
  }

  try {
    const decoded = verifyToken(token); // Verify the JWT
    req.user = decoded; // Attach the decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
