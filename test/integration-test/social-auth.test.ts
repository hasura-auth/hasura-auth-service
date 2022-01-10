import Account from '../../src/db/models/Account';
import initDBConfigs from '../../src/config/init-db';
import request from 'supertest';
import express, { Request } from 'express';
import cookieParser from 'cookie-parser';
import router from '../../src/routes/social-login';
import { before } from 'mocha';
import sequelize from '../../src/config/sequelize';
import RsaKey from '../../src/db/models/RsaKey';
import { customExceptionHandler } from '../../src/middleware/error-handler';
import { passportUses } from '../../src/middleware/passport';
import sinon from 'sinon';
import { accountMock } from '../mocks/accountMock';
import { assert } from 'chai';

// after(async () => {
//   await sequelize.authenticate().then(async () => {
//     await sequelize.sync({ force: true }).then(async () => {
//       await Account.truncate();
//       await RsaKey.truncate();
//     });
//   });
// });

describe('social login tests', () => {
  const app = express();

  before(async () => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use('/auth/social', router);

    app.use(customExceptionHandler);

    await sequelize.authenticate().then(async () => {
      await sequelize.sync({ force: true }).then(async () => {
        await Account.truncate();
        await RsaKey.truncate();
        await initDBConfigs();
      });
    });
  });

  beforeEach(() => {
    sinon.stub(passportUses, 'github').callsFake((req: Request, res, next) => {
      req.user = accountMock;
      next();
    });
  });

  afterEach(() => sinon.restore());

  it('github auth for non existing user then create user and return', (done) => {
    request(app)
      .get('/auth/social/github/callback')
      .expect(302)
      .then((response) => {
        const refreshTokenCookie = response.header['set-cookie'][0];
        const { location } = response.headers;

        const jwtRegexp = new RegExp('[a-z]+_token.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*');

        assert.isTrue(jwtRegexp.test(refreshTokenCookie));
        assert.isDefined(location);

        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
