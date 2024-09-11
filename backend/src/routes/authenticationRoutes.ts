// routes/authRoutes.ts
import express from 'express';
import passport from 'passport';
import { googleCallback, refreshAccessToken, logout} from '../controllers/authenticationControllers';

const router = express.Router();

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), googleCallback);

// Refresh Token Route
router.post('/refresh-token', refreshAccessToken);

// Logout Route
router.get('/logout', logout);


export default router;
