import { assert } from 'chai';
import rewire from 'rewire';
import sinon, { SinonStub } from 'sinon';
import { Profile } from 'passport';
import profile from '../../../mocks/oAuthProfile';
import * as accountDao from '../../../../src/db/dao/account';
import { accountMock } from '../../../mocks/accountMock';

var rewiredAuthResponseHandler = rewire('../../../../src/middleware/passport').__get__(
  'authResponseHandler'
);

var findOneByEmailStub: SinonStub;
var createWithDefualtRoleStub: SinonStub;

describe('passport middleware tests', async () => {
  beforeEach(() => {
    createWithDefualtRoleStub = sinon
      .stub(accountDao, 'createWithDefualtRole')
      .callsFake(async () => accountMock);

    // sinon
    //   .stub(Account.prototype, 'reload')
    //   .callsFake(async () => accountMock);
  });

  afterEach(() => sinon.restore());

  it('oauth with non existing user then create account', async () => {
    findOneByEmailStub = sinon
      .stub(accountDao, 'findOneByEmail')
      .callsFake(async () => null);

    const profiletStub: Profile = profile;

    await rewiredAuthResponseHandler('', '', profiletStub, () => {});

    assert.equal(findOneByEmailStub.callCount, 1);
    assert.equal(createWithDefualtRoleStub.callCount, 1);
  });

  it('oauth with an existing user then return account', async () => {
    findOneByEmailStub = sinon
      .stub(accountDao, 'findOneByEmail')
      .callsFake(async () => accountMock);

    const profiletStub: Profile = profile;

    await rewiredAuthResponseHandler('', '', profiletStub, () => {});

    assert.equal(findOneByEmailStub.callCount, 1);
    assert.equal(createWithDefualtRoleStub.callCount, 0);
  });

  // it.only('jwt with existing user then return profile', async () => {
  //   findOneByEmailStub = sinon
  //     .stub(accountDao, 'findOneByEmail')
  //     .callsFake(async () => null);

  //   const profiletStub: Profile = profile;

  //   // await rewiredAuthResponseHandler('', '', profiletStub, () => {});

  //   assert.equal(findOneByEmailStub.callCount, 1);
  //   assert.equal(createWithDefualtRoleStub.callCount, 1);
  // });
});
