import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from './errors.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, JSON_HEADERS);
  res.end(JSON.stringify(payload));
}

export function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}

export async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    const totalLength = chunks.reduce((sum, item) => sum + item.length, 0);
    if (totalLength > 1_000_000) {
      throw new AppError(413, 'Payload Too Large');
    }
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString('utf-8').trim();
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new AppError(400, 'Invalid JSON body');
  }
}

export function getBearerToken(req) {
  const value = req.headers.authorization;
  if (!value || !value.startsWith('Bearer ')) {
    return null;
  }
  return value.slice(7).trim();
}

export async function serveStaticFile(reqPath, publicDir, res) {
  const normalizedPath = reqPath === '/' ? '/customer.html' : reqPath;
  const filePath = path.join(publicDir, normalizedPath);
  const resolved = path.resolve(filePath);
  const resolvedPublic = path.resolve(publicDir);

  if (!resolved.startsWith(resolvedPublic)) {
    throw new AppError(403, 'Forbidden');
  }

  try {
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) {
      throw new AppError(404, 'Not Found');
    }
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await fs.readFile(resolved);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(404, 'Not Found');
  }
}
