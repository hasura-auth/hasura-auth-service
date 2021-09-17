import { assert, expect } from 'chai';
import sinon from 'sinon';
import { findOneByEmail } from '../../../../../src/db/dao/account';
import Account from '../../../../../src/db/models/Account';
import { accountMock } from '../../../../mocks/accountMock';

describe('Account Dao Test', () => {
  afterEach(() => sinon.restore());

  it('user found then return', async () => {
    sinon.stub(Account, 'findOne').callsFake(async () => accountMock);

    await findOneByEmail('test').then((account) =>
      assert.equal(account.email, 'test@test.com')
    );
  });

  it('user not found then expect error', async () => {
    sinon.restore();
    sinon.stub(Account, 'findOne').callsFake(async () => null);

    await findOneByEmail('test@test.com').catch((e) =>
      expect(e.message).to.be.equals('Account not found!')
    );
  });
});
