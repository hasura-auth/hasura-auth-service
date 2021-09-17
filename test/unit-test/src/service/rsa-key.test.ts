import { assert } from 'chai';
import { generateRsaKeys } from '../../../../src/service/rsa-key';

describe('rsa-key service test', () => {
  it('valid modulus then return keys', async () => {
    const { privateKey, publicKey } = generateRsaKeys();

    assert.isNotNull(privateKey);
    assert.isNotNull(publicKey);
  });
});
