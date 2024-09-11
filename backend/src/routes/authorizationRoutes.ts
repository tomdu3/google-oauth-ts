import express from 'express';
import { verifyToken } from '../middleware/authorization';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Protected Route
router.get('/protected', verifyToken, (req, res) => {
  // If we reach here, the user is authenticated
  res.render('protectedPage', { user: (req as any).user });
});

// Protected Route that checks the user in the database
router.get('/protected2', verifyToken, async (req, res) => {
    const user = (req as any).user; // Access the authenticated user's data (from JWT)
  
    if (!user || !user.id) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }
  
    try {
      // Find the user in the database using Prisma
      const dbUser = await prisma.user.findUnique({
        where: { googleId: user.id }, // Assumes the user ID is stored in the token
      });
  
      if (!dbUser) {
        return res.status(401).json({ message: 'User not found in the database' });
      }
  
      // Log the user’s name from the database
      console.log(`User ${dbUser.name} is authorized`);
  
      // Send a response with the user’s name
      return res.json({ message: `You are authorized, ${dbUser.name}` });
    } catch (error) {
      console.error('Error finding user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  

export default router;
