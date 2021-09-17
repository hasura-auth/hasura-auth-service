import { assert } from 'chai';
import sinon from 'sinon';
import { findOneByPurpose } from '../../../../../src/db/dao/rsa-key';
import RsaKey from '../../../../../src/db/models/RsaKey';
import { accessTokenKey } from '../../../../mocks/rsaKeysMock';

describe('RsaKey Dao Test', () => {
  afterEach(() => sinon.restore());

  it('rsa-key found then return', async () => {
    sinon.stub(RsaKey, 'findOne').callsFake(async () => accessTokenKey);

    await findOneByPurpose('test', ['', '']).then((key) => assert.equal(key.id, 1));
  });

  it('rsa-key not found then expcect error', async () => {
    sinon.stub(RsaKey, 'findOne').callsFake(async () => null);

    await findOneByPurpose('test', ['', '']).catch((e) =>
      assert.equal(e.message, 'rsa key not found')
    );
  });
});
