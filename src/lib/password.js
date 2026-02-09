import { execFile } from 'node:child_process';
import crypto from 'node:crypto';

function execFileAsync(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

const PYTHON_BCRYPT_SCRIPT = `
import bcrypt
import sys

mode = sys.argv[1]

if mode == 'hash':
    password = sys.argv[2].encode('utf-8')
    hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    print(hashed)
elif mode == 'verify':
    password = sys.argv[2].encode('utf-8')
    hashed = sys.argv[3].encode('utf-8')
    ok = bcrypt.checkpw(password, hashed)
    print('1' if ok else '0')
`;

async function bcryptHash(password) {
  return execFileAsync('python3', ['-c', PYTHON_BCRYPT_SCRIPT, 'hash', password]);
}

async function bcryptVerify(password, hash) {
  const value = await execFileAsync('python3', ['-c', PYTHON_BCRYPT_SCRIPT, 'verify', password, hash]);
  return value === '1';
}

function scryptAsync(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  const hash = await bcryptHash(password);
  return {
    salt: 'bcrypt',
    hash
  };
}

export async function verifyPassword(password, salt, hash) {
  if (salt === 'bcrypt') {
    return bcryptVerify(password, hash);
  }

  // Backward compatibility: legacy scrypt hashes are accepted for login,
  // then upgraded to bcrypt by AuthService after successful authentication.
  const derived = await scryptAsync(password, salt);
  const actual = Buffer.from(hash, 'hex');
  if (derived.length !== actual.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, actual);
}
