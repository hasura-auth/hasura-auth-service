import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import { config } from 'dotenv';
import sequelize from './config/sequelize';
import initDBConfigs from './config/init-db';
import logger from './config/logger';
import router from './routes/auth';
import socialRouter from './routes/social-login';
import userRouter from './routes/user';
import './config/session-ttl';

import {
  customExceptionHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler
} from './middleware/error-handler';

config({ path: `.env` });
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  express.static(path.join('/Users/rasti/Documents/github/hasura-auth-react', 'build'))
);

app.use('/auth', router);
app.use('/auth/social', socialRouter);
app.use('/auth/user', userRouter);

app.use(customExceptionHandler);
process.on('unhandledRejection', unhandledRejectionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

sequelize
  .authenticate()
  .then(() => {
    initDBConfigs()
      .then(() => {
        logger.info('DB initialized');
        app.listen(PORT, () => {
          logger.info(`⚡️[server]: Server is running at https://localhost:${PORT}`);
        });
      })
      .catch((error: Error) => {
        logger.error(error.message);
      });
  })
  .catch((error: Error) => {
    logger.error(error.message);
  });

export default app;
