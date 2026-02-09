import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/lib/password.js';

test('password hash and verify', async () => {
  const { salt, hash } = await hashPassword('hello123');
  assert.equal(salt, 'bcrypt');
  assert.equal(hash.startsWith('$2'), true);

  const ok = await verifyPassword('hello123', salt, hash);
  const fail = await verifyPassword('hello124', salt, hash);

  assert.equal(ok, true);
  assert.equal(fail, false);
});
