import passport, { Profile } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GithubStrategy } from 'passport-github2';
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions as JwtStrategyOptions
} from 'passport-jwt';
import { createWithDefualtRole, findOneByEmail, findOneByUuid } from '../db/dao/account';
import { verify } from '../service/bcrypt';
import OAuthProviders from '../model/OAuthProvider';
import { NextFunction, Request, Response } from 'express';
import { VerifiedCallback } from 'passport-jwt';
import { findOneByKeyId, findOneByPurpose } from '../db/dao/rsa-key';
import jwt from 'jsonwebtoken';
import ServiceError from '../model/Error';
import { Builder } from 'builder-pattern';
import ErrorSeverity from '../model/ErrorSeverity';
import ErrorSource from '../model/ErrorType';

const { env } = process;

const authResponseHandler = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: VerifiedCallback
) => {
  const { provider, emails, displayName, photos } = profile;
  const email = emails[0].value;
  const avatar = photos[0]?.value;

  const existingAccount = await findOneByEmail(email);

  if (existingAccount) {
    return done(null, existingAccount);
  }

  if (!existingAccount) {
    createWithDefualtRole(email, null, OAuthProviders.GITHUB, displayName, avatar).then(
      async (account) => {
        return done(null, account);
      }
    );
  }
};

passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) => {
      findOneByEmail(email)
        .then(async (account) => {
          const validPassword = await verify(password, account.password);

          validPassword ? done(null, account) : done(null, false);
        })
        .catch(() => done(null, false));
    }
  )
);

passport.use(
  'github',
  new GithubStrategy(
    {
      clientID: env.GH_CLIENT_ID,
      clientSecret: env.GH_CLIENT_SECRET,
      callbackURL: env.GH_CALLBACK_URL
    },
    authResponseHandler
  )
);

var opts: JwtStrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

  issuer: 'hasura-auth',
  ignoreExpiration: false,
  algorithms: ['RS256'],
  secretOrKeyProvider: async (request, rawJwtToken, done) => {
    try {
      const decodedAccessToken = jwt.decode(rawJwtToken, { complete: true });
      const rsaKey = await findOneByKeyId(decodedAccessToken.header.kid, ['public']);

      return done(null, rsaKey.public);
    } catch (error) {
      done(error, null);
    }
  }
};

passport.use(
  'jwt',
  new JwtStrategy(opts, async (jwt_payload, done) => {
    if (!jwt_payload.sub) return done('missing sub in token', null);

    done(null, jwt_payload.sub);

    // findOneByUuid(jwt_payload.sub)
    //   .then((user) => done(null, user))
    //   .catch((e: Error) => done(e.message, false));
  })
);

const passportUses = {
  local: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false })(req, res, next);
  },
  github: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', { session: false })(req, res, next);
  },
  jwt: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err, tokenUserUuid, info) => {
      if (err) {
        next(
          Builder<ServiceError>()
            .message(err.message)
            .severity(ErrorSeverity.ERROR)
            .build()
        );
      }

      if (!tokenUserUuid)
        next(
          Builder<ServiceError>()
            .message('user is missing')
            .severity(ErrorSeverity.WARNING)
            .source(ErrorSource.CLIENT)
            .build()
        );

      req.user = tokenUserUuid;
      next();
    })(req, res, next);
  }
};

export { passportUses };
