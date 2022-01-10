import Account from '../models/Account';
import sequelize from '../../config/sequelize';
import Role from '../models/Role';
import ServiceError from '../../model/Error';
import ErrorSeverity from '../../model/ErrorSeverity';
import ErrorSource from '../../model/ErrorType';
import { Builder } from 'builder-pattern';
import OAuthProviders from '../../model/OAuthProvider';
import { generateHash } from '../../service/bcrypt';

const findOneByEmail = async (email: string): Promise<Account> => {
  return Account.findOne({
    where: { email }
  }).catch((e: Error) => {
    throw dbError(e.message);
  });
};

const findOneByUuid = async (uuid: string): Promise<Account> => {
  return Account.findOne({
    where: { uuid }
  }).catch((e: Error) => {
    throw dbError(e.message);
  });
};

const createWithDefualtRole = async (
  email: string,
  password: string,
  oauthProvider: OAuthProviders,
  name?: string,
  avatarUrl?: string
): Promise<Account> => {
  if (password == null && oauthProvider === OAuthProviders.LOCAL) {
    throw Builder(ServiceError)
      .message('password must be provided with local provider')
      .severity(ErrorSeverity.ERROR)
      .source(ErrorSource.SYSTEM)
      .build();
  }

  return sequelize
    .transaction(async (transaction) => {
      var passwordHash = password;

      if (oauthProvider === OAuthProviders.LOCAL)
        passwordHash = await generateHash(password);

      const account = await Account.create(
        { email, password: passwordHash, oauthProvider, name, avatarUrl },
        { transaction }
      ).catch((e: Error) => {
        throw dbError(e.message);
      });

      await Role.create(
        {
          accountId: account.id,
          authRole: 'user',
          isDefault: true
        },
        { transaction }
      ).catch((e: Error) => {
        throw dbError(e.message);
      });

      return account;
    })
    .catch((e: Error) => {
      throw dbError(e.message);
    });
};

const dbError = (message: string) => {
  return Builder(ServiceError)
    .message(message)
    .severity(ErrorSeverity.FATAL)
    .source(ErrorSource.DB)
    .build();
};

export { findOneByEmail, findOneByUuid, createWithDefualtRole };
