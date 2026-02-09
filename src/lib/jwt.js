import crypto from 'node:crypto';
import { AppError } from './errors.js';

function base64UrlEncode(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer.toString('base64url');
}

function base64UrlDecode(input) {
  return Buffer.from(input, 'base64url').toString('utf-8');
}

function signRaw(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function signJwt(payload, secret, expiresInSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = signRaw(unsigned, secret);
  return `${unsigned}.${signature}`;
}

export function verifyJwt(token, secret) {
  if (!token) {
    throw new AppError(401, 'Missing token');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new AppError(401, 'Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const expected = signRaw(unsigned, secret);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new AppError(401, 'Invalid token signature');
  }

  let header;
  let claims;
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader));
    claims = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new AppError(401, 'Invalid token payload');
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new AppError(401, 'Unsupported token header');
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp !== 'number' || claims.exp < now) {
    throw new AppError(401, 'Token expired');
  }

  return claims;
}
