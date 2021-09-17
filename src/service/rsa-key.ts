import { Builder } from 'builder-pattern';
import { generateKeyPairSync, KeyPairSyncResult, createSign } from 'crypto';
import { JWK } from 'node-jose';
import ErrorSource from '../model/ErrorType';
import { findAll } from '../db/dao/rsa-key';
import ServiceError from '../model/Error';
import ErrorSeverity from '../model/ErrorSeverity';

const generateRsaKeys = (): KeyPairSyncResult<string, string> => {
  try {
    return generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
  } catch (e) {
    throw Builder(ServiceError)
      .message('unable to generate rsa keys')
      .severity(ErrorSeverity.FATAL)
      .source(ErrorSource.SYSTEM)
      .build();
  }
};

const getJwks = async (): Promise<JWK.Key[]> => {
  return findAll(['keyId', 'purpose', 'public']).then((keys) => {
    const accessAndRefreshExists = keys.filter(
      (key) => key.purpose === 'access' || key.purpose === 'refresh'
    );

    if (accessAndRefreshExists.length < 2) {
      throw Builder(ServiceError)
        .message('missing rsa keys')
        .severity(ErrorSeverity.FATAL)
        .build();
    }

    const jwks = keys.map(
      async (key) =>
        await JWK.asKey(key.public, 'pem', {
          kid: key.keyId
        })
    );

    return Promise.all(jwks);
  });
};

export { generateRsaKeys, getJwks };
