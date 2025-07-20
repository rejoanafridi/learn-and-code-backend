import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

import { errorConverter, errorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import httpStatus from 'http-status';

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
