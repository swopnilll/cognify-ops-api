// app.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';

import configurePassport from './middleware/passportMiddleware';
import router from './routes/routes';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined')); // HTTP request logger

// Initialize Passport.js
configurePassport();

// Routes
app.use('/api', router);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});
  

export default app;