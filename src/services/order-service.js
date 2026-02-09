import crypto from 'node:crypto';
import { AppError } from '../lib/errors.js';

const VALID_STATUSES = new Set(['대기중', '준비중', '완료']);

function buildOrderNumber(orderId, tableNumber) {
  const suffix = String(orderId).padStart(4, '0');
  return `${tableNumber}-${suffix}`;
}

function createSessionId(tableNumber) {
  return `sess-${tableNumber}-${crypto.randomBytes(6).toString('hex')}`;
}

export class OrderService {
  constructor({ dataStore, sseHub }) {
    this.dataStore = dataStore;
    this.sseHub = sseHub;
  }

  async createOrder(claims, payload) {
    const { storeId, tableNumber } = claims;
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new AppError(400, 'items are required');
    }

    const result = await this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const table = store.tables.find((item) => item.tableNumber === tableNumber);
      if (!table) {
        throw new AppError(404, 'Table not found');
      }

      if (!table.activeSessionId) {
        table.activeSessionId = createSessionId(tableNumber);
        table.sessionStartedAt = new Date().toISOString();
      }
      const sessionId = table.activeSessionId;

      const menuMap = new Map(
        store.menus.filter((menu) => menu.isActive !== false).map((menu) => [menu.menuId, menu])
      );

      const items = payload.items.map((item) => {
        const menu = menuMap.get(item.menuId);
        const quantity = Number(item.quantity);
        if (!menu || !Number.isInteger(quantity) || quantity <= 0) {
          throw new AppError(400, 'Invalid order item');
        }
        return {
          menuId: menu.menuId,
          menuName: menu.name,
          quantity,
          unitPrice: menu.price,
          lineTotal: menu.price * quantity
        };
      });

      const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const orderId = `o-${data.meta.nextOrderId++}`;
      const order = {
        orderId,
        orderNumber: buildOrderNumber(orderId.replace('o-', ''), tableNumber),
        storeId,
        tableNumber,
        sessionId,
        status: '대기중',
        items,
        totalAmount,
        createdAt: new Date().toISOString()
      };

      store.orders.push(order);
      return order;
    });

    this.sseHub.broadcast(storeId, 'order-created', { order: result });
    return result;
  }

  async listCurrentSessionOrders(claims, page = 1, pageSize = 20) {
    const { storeId, tableNumber } = claims;
    const data = await this.dataStore.read();
    const store = this.dataStore.findStore(data, storeId);
    const table = store.tables.find((item) => item.tableNumber === tableNumber);
    if (!table || !table.activeSessionId) {
      return {
        total: 0,
        page,
        pageSize,
        items: []
      };
    }
    const sessionId = table.activeSessionId;

    const filtered = store.orders
      .filter((order) => order.tableNumber === tableNumber && order.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const start = (page - 1) * pageSize;
    return {
      total: filtered.length,
      page,
      pageSize,
      items: filtered.slice(start, start + pageSize)
    };
  }

  async listDashboardOrders(storeId) {
    const data = await this.dataStore.read();
    const store = this.dataStore.findStore(data, storeId);

    const grouped = new Map();
    for (const order of store.orders) {
      if (!grouped.has(order.tableNumber)) {
        grouped.set(order.tableNumber, []);
      }
      grouped.get(order.tableNumber).push(order);
    }

    const cards = [...grouped.entries()].map(([tableNumber, orders]) => {
      const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const totalAmount = sorted.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        tableNumber,
        totalAmount,
        orderCount: sorted.length,
        latestOrders: sorted.slice(0, 3)
      };
    });

    return cards.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber));
  }

  async updateOrderStatus(storeId, orderId, status) {
    if (!VALID_STATUSES.has(status)) {
      throw new AppError(400, 'Invalid status');
    }

    const updated = await this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const order = store.orders.find((item) => item.orderId === orderId);
      if (!order) {
        throw new AppError(404, 'Order not found');
      }
      order.status = status;
      return order;
    });

    this.sseHub.broadcast(storeId, 'order-updated', { order: updated });
    return updated;
  }

  async deleteOrder(storeId, orderId) {
    const deleted = await this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const index = store.orders.findIndex((item) => item.orderId === orderId);
      if (index === -1) {
        throw new AppError(404, 'Order not found');
      }
      const [order] = store.orders.splice(index, 1);
      return order;
    });

    this.sseHub.broadcast(storeId, 'order-deleted', {
      orderId: deleted.orderId,
      tableNumber: deleted.tableNumber,
      sessionId: deleted.sessionId
    });
    return deleted;
  }
}
