import { AppError } from '../lib/errors.js';
import { signJwt, verifyJwt } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';

export class AuthService {
  constructor({ dataStore, jwtSecret }) {
    this.dataStore = dataStore;
    this.jwtSecret = jwtSecret;
    this.loginAttempts = new Map();
  }

  getAttemptKey(storeId, username) {
    return `${storeId}:${username}`;
  }

  checkLock(storeId, username) {
    const key = this.getAttemptKey(storeId, username);
    const state = this.loginAttempts.get(key);
    if (!state) {
      return;
    }
    if (state.lockUntil && state.lockUntil > Date.now()) {
      throw new AppError(429, 'Too many login attempts. Try again later.');
    }
  }

  recordFailure(storeId, username) {
    const key = this.getAttemptKey(storeId, username);
    const prev = this.loginAttempts.get(key) || { failedCount: 0, lockUntil: 0 };
    const failedCount = prev.failedCount + 1;
    const lockUntil = failedCount >= 5 ? Date.now() + 5 * 60 * 1000 : 0;
    this.loginAttempts.set(key, { failedCount, lockUntil });
  }

  clearFailure(storeId, username) {
    this.loginAttempts.delete(this.getAttemptKey(storeId, username));
  }

  async loginAdmin({ storeId, username, password }) {
    if (!storeId || !username || !password) {
      throw new AppError(400, 'storeId, username, password are required');
    }

    this.checkLock(storeId, username);

    const data = await this.dataStore.read();
    const store = this.dataStore.findStore(data, storeId);
    const admin = store.adminUsers.find((item) => item.username === username);

    if (!admin) {
      this.recordFailure(storeId, username);
      throw new AppError(401, 'Invalid credentials');
    }

    const ok = await verifyPassword(password, admin.passwordSalt, admin.passwordHash);
    if (!ok) {
      this.recordFailure(storeId, username);
      throw new AppError(401, 'Invalid credentials');
    }

    if (admin.passwordSalt !== 'bcrypt') {
      const upgraded = await hashPassword(password);
      await this.dataStore.update(async (latestData) => {
        const latestStore = this.dataStore.findStore(latestData, storeId);
        const latestAdmin = latestStore.adminUsers.find((item) => item.id === admin.id);
        if (latestAdmin) {
          latestAdmin.passwordSalt = upgraded.salt;
          latestAdmin.passwordHash = upgraded.hash;
        }
      });
    }

    this.clearFailure(storeId, username);

    const token = signJwt(
      {
        sub: admin.id,
        role: 'admin',
        storeId,
        username
      },
      this.jwtSecret,
      16 * 60 * 60
    );

    return {
      token,
      expiresInSeconds: 16 * 60 * 60
    };
  }

  async loginTable({ storeId, tableNumber, tablePassword }) {
    if (!storeId || !tableNumber || !tablePassword) {
      throw new AppError(400, 'storeId, tableNumber, tablePassword are required');
    }

    return this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const table = store.tables.find((item) => item.tableNumber === tableNumber);
      if (!table) {
        throw new AppError(404, 'Table not found');
      }
      if (table.tablePassword !== tablePassword) {
        throw new AppError(401, 'Invalid table credentials');
      }

      const token = signJwt(
        {
          sub: `table-${tableNumber}`,
          role: 'table',
          storeId,
          tableNumber
        },
        this.jwtSecret,
        16 * 60 * 60
      );

      return {
        token,
        sessionId: table.activeSessionId,
        expiresInSeconds: 16 * 60 * 60
      };
    });
  }

  verifyToken(token, role) {
    const claims = verifyJwt(token, this.jwtSecret);
    if (role && claims.role !== role) {
      throw new AppError(403, 'Forbidden role');
    }
    return claims;
  }
}
