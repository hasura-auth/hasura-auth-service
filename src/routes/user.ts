import { Router, Request, Response, NextFunction } from 'express';
import { passportUses } from '../middleware/passport';
import UserResponse from '../model/UserResponse';
import { Builder } from 'builder-pattern';
import Account from '../db/models/Account';
import PatchUserRequest from '../../src/model/PatchUserRequest';
import { validateBasicAuthUser } from '../middleware/validation';
import BasicAuthUser from '../model/BasicAuthUser';
import { createWithDefualtRole, findOneByEmail } from '../db/dao/account';
import ServiceError from '../model/Error';
import ErrorSource from '../model/ErrorType';
import { generateHash } from '../service/bcrypt';
import OAuthProviders from '../model/OAuthProvider';
import HttpStatusCode from '../model/HttpStatusCode';

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
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as Account;

    const userResp: UserResponse = Builder<UserResponse>()
      .id(user.uuid)
      .name(user.name)
      .email(user.email)
      .avatarUrl(user.avatarUrl)
      .build();

    res.send(userResp);
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

export default router;
