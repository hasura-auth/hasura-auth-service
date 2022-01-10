import RsaKey from '../../src/db/models/RsaKey';
import fs from 'fs';

const accessTokenPrivateKey = fs
  .readFileSync(__dirname + '/../config/rsa-keys/access-token/private.pem')
  .toString();
const accessTokenPublicKey = fs
  .readFileSync(__dirname + '/../config/rsa-keys/access-token/public.pem')
  .toString();

const refreshTokenPrivateKey = fs
  .readFileSync(__dirname + '/../config/rsa-keys/refresh-token/private.pem')
  .toString();
const refreshTokenPublicKey = fs
  .readFileSync(__dirname + '/../config/rsa-keys/refresh-token/public.pem')
  .toString();

const accessTokenKey = new RsaKey({
  id: 1,
  keyId: '1',
  purpose: 'access',
  private: accessTokenPrivateKey,
  public: accessTokenPublicKey
});

const refreshTokenKey = new RsaKey({
  id: 1,
  keyId: '2',
  purpose: 'refresh',
  private: refreshTokenPrivateKey,
  public: refreshTokenPublicKey
});

export { accessTokenKey, refreshTokenKey };
