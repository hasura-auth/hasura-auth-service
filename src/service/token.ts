import jwt from 'jsonwebtoken';
import Account from '../db/models/Account';
import { findOneByPurpose } from '../db/dao/rsa-key';
import ErrorSeverity from '../model/ErrorSeverity';
import ErrorSource from '../model/ErrorType';
import { Builder } from 'builder-pattern';
import ServiceError from '../model/Error';
import Session from '../db/models/session';

const { env } = process;

const generateAccessToken = async (account: Account): Promise<string> => {
  if (!account || (account && account.roles.length == 0)) {
    throw Builder(ServiceError)
      .message('invalid account')
      .source(ErrorSource.SYSTEM)
      .severity(ErrorSeverity.ERROR)
      .build();
  }

  const rolesAsArray = account.roles.map((role) => role.authRole);
  const defaultRole = account.roles.find((role) => role.isDefault);

  const hasuraClaims = {
    // profile: {
    //   name: account.name,
    //   avatarUrl: account.avatarUrl
    // },
    'https://hasura.io/jwt/claims': {
      'x-hasura-allowed-roles': rolesAsArray,
      'x-hasura-default-role': defaultRole.authRole,
      'x-hasura-user-id': account.uuid
      // 'x-hasura-org-id': '1'
      // "x-hasura-custom": "custom-value"
    }
  };

  return findOneByPurpose('access', ['keyId', 'private']).then(
    ({ keyId, private: privateKey }) => {
      const privateKeyAsBuffer = Buffer.from(privateKey, 'utf-8');

      return jwt.sign(hasuraClaims, privateKeyAsBuffer, {
        issuer: 'hasura-auth',
        algorithm: 'RS256',
        subject: account.uuid,
        expiresIn: env.ACCESS_TOKEN_LIFETIME,
        keyid: keyId
      });
    }
  );
};

const generateRefreshToken = async (
  account: Account,
  session?: Session
): Promise<string> => {
  if (!account || !account.roles) {
    throw Builder(ServiceError)
      .message('invalid account')
      .source(ErrorSource.SYSTEM)
      .severity(ErrorSeverity.ERROR)
      .build();
  }

  return findOneByPurpose('refresh', ['keyId', 'private']).then(
    ({ keyId, private: privateKey }) => {
      const privateKeyAsBuffer = Buffer.from(privateKey, 'utf-8');
      const sessionId = session.sessionId.toString();

      return jwt.sign({ sub: sessionId }, privateKeyAsBuffer, {
        algorithm: 'RS512',
        expiresIn: env.REFRESH_TOKEN_LIFETIME,
        keyid: keyId
      });
    }
  );
};

const verifyRefreshToken = async (token: string): Promise<string> => {
  const { public: publicKey } = await findOneByPurpose('refresh', ['keyId', 'public']);

  const publicKeyAsBuffer = Buffer.from(publicKey, 'utf-8');

  return new Promise((resolve, reject) => {
    try {
      const verifyResult = jwt.verify(token, publicKeyAsBuffer);
      resolve(verifyResult.sub.toString());
    } catch (e) {
      reject(e);
    }
  });
};

export { generateAccessToken, generateRefreshToken, verifyRefreshToken };
