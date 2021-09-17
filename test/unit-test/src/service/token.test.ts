import { assert, expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';

import { accountMock } from '../../../mocks/accountMock';
import { accessTokenKey, refreshTokenKey } from '../../../mocks/rsaKeysMock';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../../../../src/service/token';
import RsaKey from '../../../../src/db/models/RsaKey';

describe('token service test', () => {
  beforeEach(() => {
    //stub rsaKey
    sinon.stub(RsaKey, 'findOne').callsFake(async () => accessTokenKey);
  });

  afterEach(() => sinon.restore());

  it('valid account and rsaKey then a valid access_token', async () => {
    const token = await generateAccessToken(accountMock);

    assert.doesNotThrow(() => {
      jwt.verify(token, accessTokenKey.public);
    }, 'invalid signature');

    assert.throws(() => {
      jwt.verify(token, refreshTokenKey.public);
    }, 'invalid signature');
  });

  it('valid account and rsaKey then access_token with required payload', async () => {
    const token = generateAccessToken(accountMock);
    const decoded = jwt.decode(await token);

    assert.isDefined(decoded['iat']);
    assert.isDefined(decoded['exp']);
    assert.isDefined(decoded['https://hasura.io/jwt/claims']);

    assert.equal(decoded['exp'] - decoded['iat'], 3600);
    assert.deepEqual(decoded['https://hasura.io/jwt/claims'], {
      'x-hasura-allowed-roles': ['test'],
      'x-hasura-default-role': 'test',
      'x-hasura-user-id': 'b572f034-4a5b-4c71-921c-5317ef3a9aa0'
    });
  });

  it('valid account and rsaKey then refresh_token with required payload', async () => {
    const token = generateRefreshToken(accountMock);
    const decoded = jwt.decode(await token);

    assert.isDefined(decoded['iat']);
    assert.isDefined(decoded['exp']);
    assert.isDefined(decoded['sub']);

    assert.equal(decoded['exp'] - decoded['iat'], 604800);
    assert.deepEqual(decoded['sub'], 'b572f034-4a5b-4c71-921c-5317ef3a9aa0');
  });

  it('verify a valid refresh token then return sub', async () => {
    const token = await generateRefreshToken(accountMock);
    const sub = await verifyRefreshToken(token);

    assert.equal(accountMock.uuid, sub);
  });

  it('verify an invalid refresh token then error', async () => {
    const token = 'invalid';

    try {
      await verifyRefreshToken(token);
    } catch (e) {
      expect(e.message).to.be.equals('jwt malformed');
    }
  });

  it('invalid account then throw invalid account error', async () => {
    sinon.restore();
    sinon.stub(RsaKey, 'findOne').callsFake(async () => accessTokenKey);

    try {
      await generateAccessToken(undefined);
    } catch (e) {
      expect(e.message).to.be.equals('invalid account');
    }
  });

  it('valid user and invalid rsaKey then throw error', async () => {
    sinon.restore();
    sinon.stub(RsaKey, 'findOne').callsFake(async () => null);

    try {
      await generateAccessToken(accountMock);
    } catch (e) {
      expect(e).to.be.exist;
    }
  });
});
