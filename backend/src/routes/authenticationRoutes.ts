import { login, register } from '../controllers/authenticationControllers';
import express from 'express';
import passport from 'passport';

const router = express.Router();


router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const token = await register(email, password, name);
      res.status(201).json({ token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown error occurred' });
      }
    }
  });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown error occurred' });
      }
    }
  });
  
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect or respond with token
    res.redirect('/');
  }
);

export default router;
