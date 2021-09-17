import { assert } from 'chai';
import Account from '../../src/db/models/Account';
import initDBConfigs from '../../src/config/init-db';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import router from '../../src/routes/auth';
import { before } from 'mocha';
import sequelize from '../../src/config/sequelize';
import RsaKey from '../../src/db/models/RsaKey';
import setCookieParser from 'set-cookie-parser';

import { customExceptionHandler } from '../../src/middleware/error-handler';

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

    app.use('/auth', router);

    app.use(customExceptionHandler);

    await sequelize.authenticate().then(async () => {
      await sequelize.sync({ force: true }).then(async () => {
        await Account.truncate();
        await RsaKey.truncate();
        await initDBConfigs();
      });
    });
  });

  it('get /auth/ping return pong', function (done) {
    request(app)
      .get('/auth/ping')
      .expect(200)
      .then((response) => {
        assert.equal(response.text, 'pong');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('post /auth/login with a valid user return tokens', (done) => {
    const formData = {
      email: 'admin@test.com',
      password: 'admin'
    };

    request(app)
      .post('/auth/login')
      .send(formData)
      .expect(200)
      .then((resp) => {
        const cookies = setCookieParser(resp.headers['set-cookie']);
        const refreshTokenCookie = cookies.find((a) => a.name === 'refresh_token');
        const accessTokenCookie = cookies.find((a) => a.name === 'access_token');

        assert.isDefined(resp.body.accessToken);

        assert.isDefined(refreshTokenCookie);
        assert.isTrue(refreshTokenCookie.httpOnly);

        assert.isDefined(accessTokenCookie);
        assert.isUndefined(accessTokenCookie.httpOnly);

        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('get /auth/jwk return array of rsa keys', function (done) {
    request(app)
      .get('/auth/jwk')
      .expect(200)
      .then((resp) => {
        assert.isDefined(resp.body);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('post /auth/login with a invalid user return unauthorized', function (done) {
    const formData = {
      email: 'test@test.com',
      password: 'test121'
    };

    request(app)
      .post('/auth/login')
      .send(formData)
      .expect(401)
      .then((resp) => {
        assert.equal(resp.text, 'Unauthorized');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
