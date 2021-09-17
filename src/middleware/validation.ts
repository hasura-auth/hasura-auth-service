import { NextFunction, Request, Response } from 'express';
import ServiceError from '../model/Error';
import ErrorSource from '../model/ErrorType';
import BasicAuthUser from '../model/BasicAuthUser';
import { Builder } from 'builder-pattern';

const validateBasicAuthUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as BasicAuthUser;

  if (!email || !password) {
    next(
      Builder(ServiceError)
        .message('missing user name or password')
        .source(ErrorSource.CLIENT)
        .build()
    );
    return;
  }

  if (!validateEmail(email)) {
    next(
      Builder(ServiceError)
        .message('invalid email is provided')
        .source(ErrorSource.CLIENT)
        .build()
    );
  }
  next();
};

const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export { validateBasicAuthUser };
