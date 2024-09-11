import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import "./controllers/googleControllers";
import authenticationRoutes from './routes/authenticationRoutes';
import passport from 'passport';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Authentication Routes
app.use('/auth', authenticationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
