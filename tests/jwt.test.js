import test from 'node:test';
import assert from 'node:assert/strict';
import { signJwt, verifyJwt } from '../src/lib/jwt.js';

test('JWT sign and verify', () => {
  const secret = 'test-secret';
  const token = signJwt({ sub: 'u1', role: 'admin' }, secret, 60);
  const claims = verifyJwt(token, secret);

  assert.equal(claims.sub, 'u1');
  assert.equal(claims.role, 'admin');
  assert.ok(claims.exp > claims.iat);
});

test('JWT rejects tampered token', () => {
  const secret = 'test-secret';
  const token = signJwt({ sub: 'u1' }, secret, 60);
  const parts = token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ sub: 'u2', exp: 9999999999 })).toString('base64url');

  assert.throws(() => verifyJwt(parts.join('.'), secret));
});
