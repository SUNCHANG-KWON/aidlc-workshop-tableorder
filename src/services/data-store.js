import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../lib/errors.js';
import { hashPassword } from '../lib/password.js';

const DEFAULT_STORE_ID = 'demo-store';

function nowIso() {
  return new Date().toISOString();
}

function createSeedMenus() {
  return [
    {
      menuId: 'm-1',
      name: '시그니처 파스타',
      price: 15900,
      description: '크림과 베이컨, 버섯이 어우러진 대표 메뉴',
      category: '메인',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
      displayOrder: 1,
      isActive: true
    },
    {
      menuId: 'm-2',
      name: '불고기 라이스',
      price: 12900,
      description: '달콤짭짤 소불고기와 밥',
      category: '메인',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      displayOrder: 2,
      isActive: true
    },
    {
      menuId: 'm-3',
      name: '레몬에이드',
      price: 4500,
      description: '상큼한 수제 레몬에이드',
      category: '음료',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
      displayOrder: 3,
      isActive: true
    },
    {
      menuId: 'm-4',
      name: '초코 브라우니',
      price: 5900,
      description: '바닐라 아이스크림과 함께 제공',
      category: '디저트',
      imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e',
      displayOrder: 4,
      isActive: true
    }
  ];
}

export async function createSeedData() {
  const hashed = await hashPassword('admin1234');
  return {
    meta: {
      createdAt: nowIso(),
      nextOrderId: 1,
      nextMenuId: 5,
      nextHistoryId: 1
    },
    stores: [
      {
        storeId: DEFAULT_STORE_ID,
        name: 'AIDLC Demo Store',
        adminUsers: [
          {
            id: 'admin-1',
            username: 'admin',
            passwordHash: hashed.hash,
            passwordSalt: hashed.salt
          }
        ],
        tables: [
          { tableNumber: 'T1', tablePassword: '1111', activeSessionId: null, sessionStartedAt: null },
          { tableNumber: 'T2', tablePassword: '2222', activeSessionId: null, sessionStartedAt: null },
          { tableNumber: 'T3', tablePassword: '3333', activeSessionId: null, sessionStartedAt: null }
        ],
        menus: createSeedMenus(),
        orders: [],
        orderHistories: []
      }
    ]
  };
}

export class DataStore {
  constructor(dbPath) {
    this.dbPath = dbPath;
  }

  async ensureInitialized() {
    const dir = path.dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(this.dbPath);
    } catch {
      const seed = await createSeedData();
      await this.write(seed);
    }
  }

  async read() {
    await this.ensureInitialized();
    const raw = await fs.readFile(this.dbPath, 'utf-8');
    try {
      return JSON.parse(raw);
    } catch {
      throw new AppError(500, 'Data store is corrupted');
    }
  }

  async write(data) {
    const tempPath = `${this.dbPath}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
    await fs.rename(tempPath, this.dbPath);
  }

  async update(mutator) {
    const data = await this.read();
    const result = await mutator(data);
    await this.write(data);
    return result;
  }

  findStore(data, storeId) {
    const store = data.stores.find((item) => item.storeId === storeId);
    if (!store) {
      throw new AppError(404, 'Store not found');
    }
    return store;
  }
}
