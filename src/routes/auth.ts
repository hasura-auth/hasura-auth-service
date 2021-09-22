import { NextFunction, Request, Response, Router } from 'express';
import { passportUses } from '../middleware/passport';
import Account from '../db/models/Account';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../service/token';
import { findOneByUuid } from '../db/dao/session';
import ServiceError from '../model/Error';
import RefreshTokenCookie from '../model/RefreshTokenCookie';
import ErrorSource from '../model/ErrorType';
import { getJwks } from '../service/rsa-key';
import { Builder } from 'builder-pattern';
import LogonResponse from '../model/LoginResponse';
import ms from 'ms';
import { createSession } from '../db/dao/session';
import { epochInSeconds } from '../service/time';

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
    const account = req.user as Account;
    const expiresIn = Date.now() + ms(env.REFRESH_TOKEN_LIFETIME);

    const session = await createSession(account.id, epochInSeconds(expiresIn));
    const accessToken = await generateAccessToken(account);
    const refreshToken = await generateRefreshToken(account, session);
    const url = new URL(env.CLIENT_CALLBACK_URL);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      domain: url.hostname,
      expires: new Date(expiresIn)
    });

    res.cookie('access_token', accessToken, {
      domain: url.hostname,
      maxAge: ms(env.ACCESS_TOKEN_LIFETIME)
    });

    res.send(Builder<LogonResponse>().redirectUri(url).accessToken(accessToken).build());
  }
);

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refresh_token').clearCookie('access_token').sendStatus(200);
});

router.get('/token/refresh', async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token: incomingRefreshToken } = req.cookies as RefreshTokenCookie;

  const sub = await verifyRefreshToken(incomingRefreshToken);
  const session = await findOneByUuid(sub);

  if (!session) {
    res.clearCookie('refresh_token').clearCookie('access_token').sendStatus(401);
  }

  const account = session.account;
  const accessToken = await generateAccessToken(account);
  const refreshToken = await generateRefreshToken(account, session);
  const url = new URL(env.CLIENT_CALLBACK_URL);
  const expiresIn = Date.now() + ms(env.REFRESH_TOKEN_LIFETIME);

  session.validUntil = epochInSeconds(expiresIn);
  session.save();

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    domain: url.hostname,
    maxAge: ms(env.REFRESH_TOKEN_LIFETIME)
  });

  res.cookie('access_token', accessToken, {
    domain: url.hostname,
    maxAge: ms(env.ACCESS_TOKEN_LIFETIME)
  });

  res.send({ access_token: accessToken });
});

export default router;
