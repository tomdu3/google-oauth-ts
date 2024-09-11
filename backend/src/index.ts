import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authenticationRoutes from './routes/authenticationRoutes';
import authorizationRoutes from './routes/authorizationRoutes';
import './config/passportConfig'; // Make sure this path is correct

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// Initialize Passport
app.use(passport.initialize()); // Since you are not using sessions, only initialize Passport

// Routes
app.use('/auth', authenticationRoutes); // All authentication-related routes
app.use('/', authorizationRoutes); // Other routes

// Error handling (optional)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
