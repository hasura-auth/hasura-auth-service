import { Router, Request, Response, NextFunction } from 'express';
import { passportUses } from '../middleware/passport';
import UserResponse from '../model/UserResponse';
import { Builder } from 'builder-pattern';
import Account from '../db/models/Account';
import { findOneByUuid } from '../db/dao/Account';
import PatchUserRequest from '../model/PatchUserRequest';
import { validateBasicAuthUser } from '../middleware/validation';
import BasicAuthUser from '../model/BasicAuthUser';
import { createWithDefualtRole, findOneByEmail } from '../db/dao/account';
import ServiceError from '../model/Error';
import ErrorSource from '../model/ErrorType';
import { generateHash } from '../service/bcrypt';
import OAuthProviders from '../model/OAuthProvider';
import HttpStatusCode from '../model/HttpStatusCode';
import ErrorSeverity from '../model/ErrorSeverity';

const router = Router();

router.post(
  '',
  validateBasicAuthUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as BasicAuthUser;

    const accountExists = await findOneByEmail(email);

    if (accountExists) {
      next(
        Builder(ServiceError)
          .message('user exists already')
          .source(ErrorSource.CLIENT)
          .build()
      );
      return;
    }

    const hash = await generateHash(password);
    createWithDefualtRole(email, password, OAuthProviders.LOCAL)
      .then(() => {
        res.sendStatus(HttpStatusCode.CREATED);
      })
      .catch((e) => {
        next(e);
      });
  }
);

router.get(
  '',
  (req, res, next) => passportUses.jwt(req, res, next),
  async (req: Request, res: Response, next: NextFunction) => {
    const accountUuid = req.user as string;
    const { id: urlUserId } = req.params;

    const account = await findOneByUuid(accountUuid);
    const isAdminUser = account.roles.filter((role) => role.authRole === 'admin');

    if (!authorized(urlUserId, account))
      next(
        Builder<ServiceError>()
          .message('unauthorized')
          .severity(ErrorSeverity.WARNING)
          .source(ErrorSource.CLIENT)
          .build()
      );
    else {
      const userResp: UserResponse = Builder<UserResponse>()
        .id(account.uuid)
        .name(account.name)
        .email(account.email)
        .avatarUrl(account.avatarUrl)
        .build();

      res.send(userResp);
    }
  }
);

router.patch(
  '',
  (req, res, next) => passportUses.jwt(req, res, next),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user as Account;
    const { name, avatarUrl } = req.body as PatchUserRequest;

    user.avatarUrl = avatarUrl;
    user.name = name;

    user.save().then(() => res.sendStatus(204));
  }
);

router.delete(
  '',
  (req, res, next) => passportUses.jwt(req, res, next),
  (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = req.user as Account;
    const { name, avatarUrl } = req.body as PatchUserRequest;

    user.avatarUrl = avatarUrl;
    user.name = name;

    user.save().then(() => res.sendStatus(204));
  }
);

const authorized = (urlUserId: string, tokenUser: Account) => {
  if (!tokenUser) return false;

  const isAdminUser = tokenUser.roles.filter((role) => role.authRole === 'admin');

  if (tokenUser.uuid !== urlUserId && !isAdminUser) return false;
  else return true;
};

export default router;
