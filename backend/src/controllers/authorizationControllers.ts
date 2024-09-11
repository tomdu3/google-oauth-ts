// controllers/protectedController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Controller for the protected page
export const getProtectedPage = (req: Request, res: Response) => {
  res.render('protectedPage', { user: (req as any).user });
};

// Controller for the route that checks the user in the database
export const checkUserInDatabase = async (req: Request, res: Response) => {
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
};
