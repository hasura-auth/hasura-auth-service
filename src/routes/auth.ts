import { NextFunction, Request, Response, Router } from 'express';
import path from 'path';
import { passportUses } from '../middleware/passport';
import Account from '../db/models/Account';
import { generateHash } from '../service/bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../service/token';
import { createWithDefualtRole, findOneByEmail, findOneByUuid } from '../db/dao/account';
import ServiceError from '../model/Error';
import BasicAuthUser from '../model/BasicAuthUser';
import RefreshTokenCookie from '../model/RefreshTokenCookie';
import HttpStatusCode from '../model/HttpStatusCode';
import ErrorSource from '../model/ErrorType';
import { getJwks } from '../service/rsa-key';
import { validateBasicAuthUser } from '../middleware/validation';
import { Builder } from 'builder-pattern';
import OAuthProviders from '../model/OAuthProvider';
import LogonResponse from '../model/LoginResponse';
import ms from 'ms';

const router = Router();
const { env } = process;

router.get('/ping', (req: Request, res: Response) => {
  res.status(200).send('pong');
});

// router.get('/index', (req: Request, res: Response) => {
//   res.sendFile(
//     path.join('/Users/rasti/Documents/github/hasura-auth-react/', 'public', 'index.html')
//   );
// });

router.get('/jwk', (req: Request, res: Response, next: NextFunction) => {
  getJwks()
    .then((jwks) => {
      const returnObj = { keys: [] };
      returnObj.keys = jwks;

      res.send(returnObj);
    })
    .catch((e) => next(e));
});

router.post(
  '/login',
  (req, res, next) => passportUses.local(req, res, next),
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = await generateAccessToken(req.user as Account);
    const refreshToken = await generateRefreshToken(req.user as Account);

    console.log('login ----------');
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      domain: 'localhost',
      secure: true,
      sameSite: 'lax',
      maxAge: ms(env.REFRESH_TOKEN_LIFETIME)
    });

    res.cookie('access_token', accessToken, {
      domain: 'localhost',
      maxAge: ms(env.ACCESS_TOKEN_LIFETIME)
    });

    const url = new URL('http://localhost:3000');
    res.send(Builder<LogonResponse>().redirectUri(url).accessToken(accessToken).build());
  }
);

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refresh_token').clearCookie('access_token').sendStatus(200);
});

router.get('/token/refresh', (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token: incomingRefreshToken } = req.cookies as RefreshTokenCookie;
  console.log('refresh ----------');

  verifyRefreshToken(incomingRefreshToken)
    .then(async (sub) => {
      const account = await findOneByUuid(sub);
      const accessToken = await generateAccessToken(account);
      const refreshToken = await generateRefreshToken(account);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        domain: 'localhost',
        secure: true,
        sameSite: 'lax',
        maxAge: ms(env.REFRESH_TOKEN_LIFETIME)
      });

      res.cookie('access_token', accessToken, {
        domain: 'localhost',
        maxAge: ms(env.ACCESS_TOKEN_LIFETIME)
      });

      res.send({ access_token: accessToken });
    })
    .catch((e) => {
      next(
        Builder(ServiceError).message('invalid token').source(ErrorSource.CLIENT).build()
      );
    });
});

export default router;
