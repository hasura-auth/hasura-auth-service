import { assert, expect } from 'chai';
import { generateHash, verify } from '../../../../src/service/bcrypt';

describe('bcrypt service test', () => {
  const testPass = 'test123';

  it('generateHash returns a hash', async () => {
    const hash = await generateHash(testPass);
    const verifyResult = await verify(testPass, hash);

    assert.isTrue(verifyResult);
  });

  it('generateHash for empty password expect error', async () => {
    try {
      await generateHash(undefined);
    } catch (e) {
      expect(e.message).to.be.equal('data and salt arguments required');
    }
  });

  it('verity of non-matching password & hash returns false', async () => {
    const hash = await generateHash(testPass);
    const verifyResult = await verify('123test', hash);

    assert.isFalse(verifyResult);
  });
});
