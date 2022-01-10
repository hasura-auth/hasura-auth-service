import { Router } from 'express';
import { passportUses } from '../middleware/passport';
import Account from '../db/models/Account';
import { generateAccessToken, generateRefreshToken } from '../service/token';
import ms from 'ms';
import { createSession } from '../db/dao/session';
import { epochInSeconds } from '../service/time';

const router = Router();
const { env } = process;

router.get('/github', passportUses.github);

router.get(
  '/github/callback',
  (req, res, next) => passportUses.github(req, res, next),
  async (req, res, next) => {
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

    res.redirect(url.toString());
  }
);

export default router;
