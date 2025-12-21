import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

import requestLogger from './middlewares/requestLogger';
import coreAuthRouter from './routes/coreRoutes/coreAuth';
import coreApiRouter from './routes/coreRoutes/coreApi';
import coreDownloadRouter from './routes/coreRoutes/coreDownloadRouter';
import corePublicRouter from './routes/coreRoutes/corePublicRouter';
import adminAuth from './controllers/coreControllers/adminAuth';
import errorHandlers from './handlers/errorHandlers';
import erpApiRouter from './routes/appRoutes/appApi';

// create our Express app
const app: Application = express();

// Request logging middleware (should be first to capture all requests)
app.use(requestLogger);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes

app.use('/api', coreAuthRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
export default app;


