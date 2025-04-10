import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import configurePassport from './middleware/passportMiddleware';
import router from './routes/routes';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
})); 

// Initialize Passport.js
configurePassport();

// Routes
app.use('/api', router);

// Global Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
  res.status(500).json({ error: err.message });
});

export default app;
