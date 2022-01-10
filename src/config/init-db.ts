import { nanoid } from 'nanoid';

import { generateHash } from '../service/bcrypt';
import Account from '../db/models/Account';
import RsaKey from '../db/models/RsaKey';
import { generateRsaKeys } from '../service/rsa-key';
import Role from '../db/models/Role';
import { findOneByEmail } from '../db/dao/account';
import ServiceError from '../model/Error';
import { Builder } from 'builder-pattern';
import OAuthProviders from '../model/OAuthProvider';

const initDBConfigs = async (): Promise<boolean> => {
  //create and save RSA keys to DB
  const { env } = process;

  const rsaKeys = RsaKey.count()
    .then(async (noOfKeys: number) => {
      if (noOfKeys != 0) return;
      const { publicKey: accPublic, privateKey: accPrivate } = generateRsaKeys();
      const { publicKey: refPublic, privateKey: refPrivate } = generateRsaKeys();

      await RsaKey.create({
        keyId: nanoid(10),
        purpose: 'access',
        public: accPublic,
        private: accPrivate,
        priority: 100
      }).catch((e: Error) => {
        throw Builder(ServiceError).message(e.message).build();
      });

      await RsaKey.create({
        keyId: nanoid(10),
        purpose: 'refresh',
        public: refPublic,
        private: refPrivate,
        priority: 101
      }).catch((e: Error) => {
        throw Builder(ServiceError).message(e.message).build();
      });
    })
    .catch((e: Error) => {
      throw Builder(ServiceError).message(e.message).build();
    });

  //create admin account if not existed
  const adminAccount = findOneByEmail(env.ADMIN_EMAIL)
    .then(async (adminAccount) => {
      if (adminAccount) return;

      const hash = await generateHash(env.ADMIN_PASSWORD);

      try {
        const acc = await Account.create({
          email: env.ADMIN_EMAIL,
          password: hash,
          oauthProvider: OAuthProviders.LOCAL,
          name: 'test testson',
          avatarUrl: 'https://demos.creative-tim.com/notus-nextjs/img/team-2-800x800.jpg'
        });

        await Role.create({
          accountId: acc.id,
          authRole: 'admin',
          isDefault: true
        });
      } catch (error) {
        throw new Error(error);
      }
    })
    .catch((e: Error) => {
      throw Builder(ServiceError).message(e.message).build();
    });

  return Promise.all([rsaKeys, adminAccount])
    .then(() => true)
    .catch(() => false);
};

export default initDBConfigs;
