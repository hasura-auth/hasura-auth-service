import { assert } from 'chai';
import Account from '../../src/db/models/Account';
import initDBConfigs from '../../src/config/init-db';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from '../../src/routes/user';
import { before } from 'mocha';
import sequelize from '../../src/config/sequelize';
import RsaKey from '../../src/db/models/RsaKey';
import setCookieParser from 'set-cookie-parser';

import { customExceptionHandler } from '../../src/middleware/error-handler';
import { accessToken } from '../mocks/tokenMocks';

// after(async () => {
//   await sequelize.authenticate().then(async () => {
//     await sequelize.sync({ force: true }).then(async () => {
//       await Account.truncate();
//       await RsaKey.truncate();
//     });
//   });
// });

describe('integration tests', () => {
  const app = express();

  before(async () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use('/auth/user', userRouter);

    app.use(customExceptionHandler);

    await sequelize.authenticate().then(async () => {
      await sequelize.sync({ force: true }).then(async () => {
        await Account.truncate();
        await RsaKey.truncate();
        await initDBConfigs();
      });
    });
  });

  it('post /auth/user return account created', function (done) {
    const formData = {
      email: 'test@test.com',
      password: 'test123'
    };

    request(app)
      .post('/auth/user')
      .send(formData)
      .expect(201)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it.skip('get /auth/user/profile return pong', function (done) {
    request(app)
      .get('/auth/user/profile')
      .set({ Authorization: accessToken })
      .expect(200)
      .then((response) => {
        assert.equal(response.text, 'pong');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
