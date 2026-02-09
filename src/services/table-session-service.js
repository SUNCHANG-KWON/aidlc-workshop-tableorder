import { AppError } from '../lib/errors.js';

export class TableSessionService {
  constructor({ dataStore, sseHub }) {
    this.dataStore = dataStore;
    this.sseHub = sseHub;
  }

  async completeSession(storeId, tableNumber) {
    const result = await this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      const table = store.tables.find((item) => item.tableNumber === tableNumber);
      if (!table) {
        throw new AppError(404, 'Table not found');
      }
      if (!table.activeSessionId) {
        throw new AppError(409, 'No active session');
      }

      const sessionId = table.activeSessionId;
      const sessionOrders = store.orders.filter(
        (order) => order.tableNumber === tableNumber && order.sessionId === sessionId
      );

      const completedAt = new Date().toISOString();
      if (sessionOrders.length > 0) {
        store.orderHistories.push({
          historyId: `h-${data.meta.nextHistoryId++}`,
          storeId,
          tableNumber,
          sessionId,
          orders: sessionOrders,
          completedAt
        });
      }

      store.orders = store.orders.filter(
        (order) => !(order.tableNumber === tableNumber && order.sessionId === sessionId)
      );

      table.activeSessionId = null;
      table.sessionStartedAt = null;

      return {
        movedOrders: sessionOrders.length,
        completedAt,
        sessionId
      };
    });

    this.sseHub.broadcast(storeId, 'session-completed', {
      tableNumber,
      sessionId: result.sessionId,
      movedOrders: result.movedOrders,
      completedAt: result.completedAt
    });

    return result;
  }

  async configureTable(storeId, tableNumber, tablePassword) {
    if (!tableNumber || !tablePassword) {
      throw new AppError(400, 'tableNumber and tablePassword are required');
    }

    return this.dataStore.update(async (data) => {
      const store = this.dataStore.findStore(data, storeId);
      let table = store.tables.find((item) => item.tableNumber === tableNumber);
      if (!table) {
        table = {
          tableNumber,
          tablePassword,
          activeSessionId: null,
          sessionStartedAt: null
        };
        store.tables.push(table);
      } else {
        table.tablePassword = tablePassword;
      }

      return {
        tableNumber: table.tableNumber,
        configuredAt: new Date().toISOString()
      };
    });
  }

  async listHistory(storeId, tableNumber, date = null) {
    const data = await this.dataStore.read();
    const store = this.dataStore.findStore(data, storeId);
    const table = store.tables.find((item) => item.tableNumber === tableNumber);
    if (!table) {
      throw new AppError(404, 'Table not found');
    }

    return store.orderHistories
      .filter((history) => history.tableNumber === tableNumber)
      .filter((history) => (date ? history.completedAt.startsWith(date) : true))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }
}
