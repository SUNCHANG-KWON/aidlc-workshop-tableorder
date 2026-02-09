import { AppError } from '../lib/errors.js';

function validateMenuPayload(payload, partial = false) {
  const required = ['name', 'price', 'category'];
  if (!partial) {
    for (const key of required) {
      if (!payload[key]) {
        throw new AppError(400, `${key} is required`);
      }
    }
  }

  if (payload.price !== undefined) {
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      throw new AppError(400, 'price must be greater than 0');
    }
  }
}

export class MenuService {
  constructor({ dataStore }) {
    this.dataStore = dataStore;
  }

  async listMenus(storeId, category = null) {
    const data = await this.dataStore.read();
    const store = this.dataStore.findStore(data, storeId);
    return store.menus
      .filter((menu) => menu.isActive !== false)
      .filter((menu) => (category ? menu.category === category : true))
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }

  async createMenu(storeId, payload) {
    validateMenuPayload(payload, false);
    return this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const menu = {
        menuId: `m-${data.meta.nextMenuId++}`,
        name: payload.name,
        price: payload.price,
        description: payload.description ?? '',
        category: payload.category,
        imageUrl: payload.imageUrl ?? '',
        displayOrder: payload.displayOrder ?? store.menus.length + 1,
        isActive: true
      };
      store.menus.push(menu);
      return menu;
    });
  }

  async updateMenu(storeId, menuId, payload) {
    validateMenuPayload(payload, true);
    return this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const menu = store.menus.find((item) => item.menuId === menuId && item.isActive !== false);
      if (!menu) {
        throw new AppError(404, 'Menu not found');
      }

      Object.assign(menu, {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.category !== undefined ? { category: payload.category } : {}),
        ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
        ...(payload.displayOrder !== undefined ? { displayOrder: payload.displayOrder } : {})
      });

      return menu;
    });
  }

  async deleteMenu(storeId, menuId) {
    return this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const menu = store.menus.find((item) => item.menuId === menuId && item.isActive !== false);
      if (!menu) {
        throw new AppError(404, 'Menu not found');
      }
      menu.isActive = false;
    });
  }
}
