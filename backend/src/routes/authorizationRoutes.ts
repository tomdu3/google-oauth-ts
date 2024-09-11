// routes/protectedRoutes.ts
import express from 'express';
import { verifyToken } from '../middleware/authorization';
import { getProtectedPage, checkUserInDatabase } from '../controllers/authorizationControllers';

const router = express.Router();

// Protected Route
router.get('/protected', verifyToken, getProtectedPage);

// Protected Route that checks the user in the database
router.get('/protected2', verifyToken, checkUserInDatabase);

export default router;
