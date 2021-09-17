import { Router } from 'express';
import { passportUses } from '../middleware/passport';
import Account from '../db/models/Account';
import { generateAccessToken, generateRefreshToken } from '../service/token';
import ms from 'ms';

const router = Router();
const { env } = process;

router.get('/github', passportUses.github);

router.get(
  '/github/callback',
  (req, res, next) => passportUses.github(req, res, next),
  async (req, res, next) => {
    const accessToken = await generateAccessToken(req.user as Account);
    const refreshToken = await generateRefreshToken(req.user as Account);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      domain: 'localhost',
      secure: true,
      sameSite: 'none'
    });

    res.cookie('access_token', accessToken, {
      domain: 'localhost',
      maxAge: ms(env.ACCESS_TOKEN_LIFETIME)
    });

    const url = new URL('http://localhost:3000');

    res.redirect(url.toString());
  }
);

export default router;
