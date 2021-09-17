import { NextFunction, Request, Response } from 'express';
import ServiceError from '../model/Error';
import ErrorSeverity from '../model/ErrorSeverity';
import ErrorSource from '../model/ErrorType';
import logger from '../config/logger';

const unhandledRejectionHandler = (error: Error): void => {
  logger.error(error.stack);
  logger.error('unhandledRejection--------------', error);
};

const uncaughtExceptionHandler = (
  error: ServiceError,
  req: Request,
  res: Response
): void => {
  logger.error(error.stack);
  logger.error('uncaughtException--------------', error);
  res.status(500).send(error.message);
};

const customExceptionHandler = (
  error: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.message == 'unauthorized') res.sendStatus(401);
  else if (error.source === ErrorSource.CLIENT) {
    logger.warn('-------------' + error.message);
    res.status(400).send(error.message);
  } else if (error.severity === ErrorSeverity.FATAL) {
    logger.error('-------------' + error.stack);
    res.sendStatus(503);
  } else if (error.severity === ErrorSeverity.ERROR) {
    logger.error('-------------' + error.stack);
    res.status(500).send(error.message);
  } else {
    next(error);
  }
};

export { customExceptionHandler, unhandledRejectionHandler, uncaughtExceptionHandler };
