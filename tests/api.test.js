import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';

import { DataStore } from '../src/services/data-store.js';
import { AuthService } from '../src/services/auth-service.js';
import { MenuService } from '../src/services/menu-service.js';
import { OrderService } from '../src/services/order-service.js';
import { TableSessionService } from '../src/services/table-session-service.js';
import { SseHub } from '../src/services/sse-hub.js';

async function createContext() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'table-order-test-'));
  const dataPath = path.join(tempDir, 'db.json');

  const dataStore = new DataStore(dataPath);
  await dataStore.ensureInitialized();

  const sseHub = new SseHub();
  const authService = new AuthService({ dataStore, jwtSecret: 'test-jwt-secret' });
  const menuService = new MenuService({ dataStore });
  const orderService = new OrderService({ dataStore, sseHub });
  const tableSessionService = new TableSessionService({ dataStore, sseHub });

  async function cleanup() {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  return {
    cleanup,
    authService,
    menuService,
    orderService,
    tableSessionService,
    sseHub
  };
}

test('service integration workflow', async (t) => {
  const ctx = await createContext();
  t.after(ctx.cleanup);

  const tableLogin = await ctx.authService.loginTable({
    storeId: 'demo-store',
    tableNumber: 'T1',
    tablePassword: '1111'
  });
  assert.ok(tableLogin.token);
  assert.equal(tableLogin.sessionId, null);

  const tableClaims = ctx.authService.verifyToken(tableLogin.token, 'table');
  assert.equal(tableClaims.storeId, 'demo-store');

  const menus = await ctx.menuService.listMenus('demo-store');
  assert.ok(menus.length > 0);

  const firstMenu = menus[0];
  const order = await ctx.orderService.createOrder(tableClaims, {
    items: [{ menuId: firstMenu.menuId, quantity: 2 }]
  });
  assert.equal(order.status, '대기중');
  assert.equal(order.tableNumber, 'T1');
  assert.ok(order.sessionId.startsWith('sess-T1-'));

  const currentOrders = await ctx.orderService.listCurrentSessionOrders(tableClaims, 1, 10);
  assert.equal(currentOrders.total, 1);

  const adminLogin = await ctx.authService.loginAdmin({
    storeId: 'demo-store',
    username: 'admin',
    password: 'admin1234'
  });
  assert.ok(adminLogin.token);

  const adminClaims = ctx.authService.verifyToken(adminLogin.token, 'admin');
  const dashboard = await ctx.orderService.listDashboardOrders(adminClaims.storeId);
  assert.equal(dashboard.length, 1);
  assert.equal(dashboard[0].tableNumber, 'T1');

  const updated = await ctx.orderService.updateOrderStatus(adminClaims.storeId, order.orderId, '준비중');
  assert.equal(updated.status, '준비중');

  await ctx.orderService.deleteOrder(adminClaims.storeId, order.orderId);
  const dashboardAfterDelete = await ctx.orderService.listDashboardOrders(adminClaims.storeId);
  assert.equal(dashboardAfterDelete.length, 0);

  const secondOrder = await ctx.orderService.createOrder(tableClaims, {
    items: [{ menuId: firstMenu.menuId, quantity: 1 }]
  });
  assert.ok(secondOrder.orderId);

  const completed = await ctx.tableSessionService.completeSession(adminClaims.storeId, 'T1');
  assert.equal(completed.movedOrders, 1);

  const history = await ctx.tableSessionService.listHistory(adminClaims.storeId, 'T1');
  assert.equal(history.length, 1);
  assert.equal(history[0].orders.length, 1);

  const configured = await ctx.tableSessionService.configureTable(adminClaims.storeId, 'T4', '4444');
  assert.equal(configured.tableNumber, 'T4');
  const tableLoginT4 = await ctx.authService.loginTable({
    storeId: 'demo-store',
    tableNumber: 'T4',
    tablePassword: '4444'
  });
  assert.ok(tableLoginT4.token);
});

test('SSE hub publishes messages to subscribers', () => {
  const hub = new SseHub();
  const writes = [];
  const filteredWrites = [];

  const res = {
    write(value) {
      writes.push(value);
    }
  };

  const filteredRes = {
    write(value) {
      filteredWrites.push(value);
    }
  };

  const unsubscribe = hub.subscribe('demo-store', res);
  const unsubscribeFiltered = hub.subscribe(
    'demo-store',
    filteredRes,
    (_event, payload) => payload?.order?.tableNumber === 'T1'
  );

  hub.broadcast('demo-store', 'order-created', { orderId: 'o-1' });
  hub.broadcast('demo-store', 'order-updated', {
    order: { orderId: 'o-2', tableNumber: 'T2', sessionId: 's-2' }
  });
  hub.broadcast('demo-store', 'order-updated', {
    order: { orderId: 'o-3', tableNumber: 'T1', sessionId: 's-1' }
  });

  unsubscribe();
  unsubscribeFiltered();

  const message = writes.find((entry) => entry.includes('event: order-created'));
  assert.ok(message);
  assert.ok(message.includes('"orderId":"o-1"'));
  assert.equal(filteredWrites.length, 1);
  assert.ok(filteredWrites[0].includes('"orderId":"o-3"'));
});
